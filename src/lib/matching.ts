import { prisma } from './prisma'
import { ItemStatus, TradeCycleStatus } from '@prisma/client'

interface TradeEdge {
  fromUserId: string
  toUserId: string
  itemId: string
}

interface TradeCycle {
  users: string[]
  edges: TradeEdge[]
  score: number
}

interface AdjacencyList {
  [userId: string]: TradeEdge[]
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Build adjacency list from Want records
 * Edge A→B exists if: A has an item that B wants
 */
async function buildGraph(): Promise<{ adjacencyList: AdjacencyList, userLocations: Map<string, {lat: number, lon: number}> }> {
  // Get all wants with item and user information
  const wants = await prisma.want.findMany({
    include: {
      item: {
        include: {
          user: true
        }
      },
      user: true
    }
  })

  const adjacencyList: AdjacencyList = {}
  const userLocations = new Map<string, {lat: number, lon: number}>()

  // Initialize adjacency list for all users and collect locations
  const allUsers = await prisma.user.findMany()
  for (const user of allUsers) {
    adjacencyList[user.id] = []
    if (user.latitude && user.longitude) {
      userLocations.set(user.id, { lat: user.latitude, lon: user.longitude })
    }
  }

  // Build edges: if user B wants item from user A, create edge A→B
  for (const want of wants) {
    const itemOwnerId = want.item.userId
    const wantingUserId = want.userId
    
    // Skip if item is not available
    if (want.item.status !== ItemStatus.AVAILABLE) {
      continue
    }

    // Skip self-wants (shouldn't happen but be safe)
    if (itemOwnerId === wantingUserId) {
      continue
    }

    // Create edge from item owner to wanting user
    if (!adjacencyList[itemOwnerId]) {
      adjacencyList[itemOwnerId] = []
    }

    adjacencyList[itemOwnerId].push({
      fromUserId: itemOwnerId,
      toUserId: wantingUserId,
      itemId: want.itemId
    })
  }

  return { adjacencyList, userLocations }
}

/**
 * Find all elementary cycles in the graph using DFS
 * Simplified version of Johnson's algorithm
 */
function findCycles(adjacencyList: AdjacencyList): TradeCycle[] {
  const cycles: TradeCycle[] = []
  const users = Object.keys(adjacencyList)

  function dfs(
    startUser: string, 
    currentUser: string, 
    path: string[], 
    edges: TradeEdge[], 
    visited: Set<string>
  ) {
    // Prevent infinite loops and cycles longer than 8 (too complex to coordinate)
    if (visited.has(currentUser)) {
      return
    }
    if (path.length > 8) {
      return
    }

    visited.add(currentUser)

    // Explore neighbors
    for (const edge of adjacencyList[currentUser] || []) {
      const nextUser = edge.toUserId
      
      // Found a cycle back to start with at least 2 edges
      if (nextUser === startUser && edges.length >= 1) {
        cycles.push({
          users: [...path],  // path doesn't include startUser again
          edges: [...edges, edge],
          score: 0
        })
      } else if (!visited.has(nextUser)) {
        dfs(startUser, nextUser, [...path, nextUser], [...edges, edge], new Set(visited))
      }
    }

    visited.delete(currentUser)
  }

  // Start DFS from each user
  for (const startUser of users) {
    dfs(startUser, startUser, [startUser], [], new Set())
  }

  return cycles
}

/**
 * Score a cycle based on:
 * - Shorter cycles are better (easier to coordinate)
 * - Location proximity bonus
 */
function scoreCycle(cycle: TradeCycle, userLocations: Map<string, {lat: number, lon: number}>): number {
  let score = 0

  // Base score inversely proportional to cycle length
  // Prefer shorter cycles: 2-user cycles get 1000, 3-user get 500, etc.
  score += Math.max(100, 1000 / cycle.users.length)

  // Location proximity bonus
  let totalDistance = 0
  let locationPairs = 0

  for (let i = 0; i < cycle.users.length; i++) {
    const currentUserId = cycle.users[i]
    const nextUserId = cycle.users[(i + 1) % cycle.users.length]
    
    const currentLocation = userLocations.get(currentUserId)
    const nextLocation = userLocations.get(nextUserId)
    
    if (currentLocation && nextLocation) {
      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lon,
        nextLocation.lat, nextLocation.lon
      )
      totalDistance += distance
      locationPairs++
    }
  }

  // Add proximity bonus: closer users get higher scores
  if (locationPairs > 0) {
    const avgDistance = totalDistance / locationPairs
    // Bonus inversely proportional to distance (max 100 bonus for 0km, decreases as distance increases)
    const proximityBonus = Math.max(0, 100 - avgDistance)
    score += proximityBonus
  }

  return score
}

/**
 * Select optimal non-overlapping cycles
 * Greedy approach: sort by score and select cycles that don't overlap
 */
function selectOptimalCycles(cycles: TradeCycle[]): TradeCycle[] {
  // Sort cycles by score (descending)
  const sortedCycles = cycles.sort((a, b) => b.score - a.score)
  
  const selectedCycles: TradeCycle[] = []
  const usedUsers = new Set<string>()
  const usedItems = new Set<string>()

  for (const cycle of sortedCycles) {
    // Check if any user or item in this cycle is already used
    const hasOverlap = cycle.users.some(userId => usedUsers.has(userId)) ||
                       cycle.edges.some(edge => usedItems.has(edge.itemId))

    if (!hasOverlap) {
      selectedCycles.push(cycle)
      
      // Mark users and items as used
      cycle.users.forEach(userId => usedUsers.add(userId))
      cycle.edges.forEach(edge => usedItems.add(edge.itemId))
    }
  }

  return selectedCycles
}

/**
 * Main matching algorithm
 * Finds optimal trade cycles and creates TradeCycle + TradeMember records
 */
export async function runMatchingAlgorithm(): Promise<{ 
  cyclesFound: number, 
  cyclesCreated: number,
  totalParticipants: number 
}> {
  console.log('🔄 Starting matching algorithm...')

  // Step 1: Build the graph
  const { adjacencyList, userLocations } = await buildGraph()
  console.log(`📊 Built graph with ${Object.keys(adjacencyList).length} users`)

  // Step 2: Find all elementary cycles
  const allCycles = findCycles(adjacencyList)
  console.log(`🔍 Found ${allCycles.length} potential cycles`)

  if (allCycles.length === 0) {
    return { cyclesFound: 0, cyclesCreated: 0, totalParticipants: 0 }
  }

  // Step 3: Score each cycle
  for (const cycle of allCycles) {
    cycle.score = scoreCycle(cycle, userLocations)
  }

  // Step 4: Select optimal non-overlapping cycles
  const selectedCycles = selectOptimalCycles(allCycles)
  console.log(`✨ Selected ${selectedCycles.length} optimal cycles`)

  // Step 5: Create TradeCycle and TradeMember records
  let cyclesCreated = 0
  let totalParticipants = 0

  for (const cycle of selectedCycles) {
    try {
      const tradeCycle = await prisma.tradeCycle.create({
        data: {
          status: TradeCycleStatus.PENDING,
          score: cycle.score,
        }
      })

      // Create TradeMember records for each participant
      // Edge[i] = edge from users[i] → users[i+1], carrying itemId (what users[i] gives)
      // So user[i] GIVES edge[i].itemId and RECEIVES edge[(i-1+n)%n].itemId
      for (let i = 0; i < cycle.users.length; i++) {
        const userId = cycle.users[i]
        const givesEdge = cycle.edges[i] // edge from this user to next — item this user gives
        const receivesEdge = cycle.edges[(i - 1 + cycle.edges.length) % cycle.edges.length] // edge from prev user — item this user receives

        await prisma.tradeMember.create({
          data: {
            cycleId: tradeCycle.id,
            userId: userId,
            givesItemId: givesEdge.itemId,
            receivesItemId: receivesEdge.itemId,
            confirmed: false,
          }
        })
      }

      cyclesCreated++
      totalParticipants += cycle.users.length
      console.log(`✅ Created cycle with ${cycle.users.length} participants (score: ${cycle.score.toFixed(2)})`)

    } catch (error) {
      console.error('❌ Error creating trade cycle:', error)
    }
  }

  console.log(`🎉 Matching complete! Created ${cyclesCreated} cycles with ${totalParticipants} total participants`)

  return {
    cyclesFound: allCycles.length,
    cyclesCreated,
    totalParticipants
  }
}