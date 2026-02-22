import { prisma } from './prisma'

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
 * Build adjacency list from RIGHT swipes within a circle
 * Edge A→B exists if: A has an item that B swiped RIGHT on in this circle
 */
async function buildGraph(circleId: string): Promise<AdjacencyList> {
  // Get all RIGHT swipes in this circle
  const swipes = await prisma.swipe.findMany({
    where: {
      circleId,
      direction: 'RIGHT',
      undone: false
    },
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

  // Initialize adjacency list for all circle members
  const circleMembers = await prisma.circleMember.findMany({
    where: { circleId }
  })

  for (const member of circleMembers) {
    adjacencyList[member.userId] = []
  }

  // Build edges: if user B swiped RIGHT on item from user A, create edge A→B
  for (const swipe of swipes) {
    const itemOwnerId = swipe.item.userId
    const swipingUserId = swipe.userId
    
    // Skip if item is not ACTIVE
    if (swipe.item.status !== 'ACTIVE') {
      continue
    }

    // Skip self-swipes (shouldn't happen but be safe)
    if (itemOwnerId === swipingUserId) {
      continue
    }

    // Create edge from item owner to swiping user
    if (!adjacencyList[itemOwnerId]) {
      adjacencyList[itemOwnerId] = []
    }

    adjacencyList[itemOwnerId].push({
      fromUserId: itemOwnerId,
      toUserId: swipingUserId,
      itemId: swipe.itemId
    })
  }

  return adjacencyList
}

/**
 * Find all elementary cycles in the graph using DFS
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
      
      // Found a cycle back to start with at least 2 edges (minimum cycle length = 2)
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
 * Score a cycle based on cycle length (shorter cycles are better)
 * No location scoring since circles are the geographic proxy
 */
function scoreCycle(cycle: TradeCycle): number {
  // Base score inversely proportional to cycle length
  // Prefer shorter cycles: 2-user cycles get 1000, 3-user get 500, etc.
  return Math.max(100, 1000 / cycle.users.length)
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
 * Circle-scoped matching algorithm
 * Finds optimal trade cycles within a circle and creates Trade + TradeMember records
 */
export async function runMatchingAlgorithm(circleId: string): Promise<{ 
  cyclesFound: number, 
  tradesCreated: number,
  participants: number 
}> {
  console.log(`🔄 Starting matching algorithm for circle ${circleId}...`)

  // Step 1: Build the graph from RIGHT swipes in this circle
  const adjacencyList = await buildGraph(circleId)
  const userCount = Object.keys(adjacencyList).length
  console.log(`📊 Built graph with ${userCount} users`)

  // Step 2: Find all elementary cycles
  const allCycles = findCycles(adjacencyList)
  console.log(`🔍 Found ${allCycles.length} potential cycles`)

  if (allCycles.length === 0) {
    return { cyclesFound: 0, tradesCreated: 0, participants: 0 }
  }

  // Step 3: Score each cycle (shorter is better)
  for (const cycle of allCycles) {
    cycle.score = scoreCycle(cycle)
  }

  // Step 4: Select optimal non-overlapping cycles
  const selectedCycles = selectOptimalCycles(allCycles)
  console.log(`✨ Selected ${selectedCycles.length} optimal cycles`)

  // Step 5: Create Trade and TradeMember records
  let tradesCreated = 0
  let totalParticipants = 0

  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 7) // 7 days from now

  for (const cycle of selectedCycles) {
    try {
      const trade = await prisma.trade.create({
        data: {
          circleId,
          status: 'MATCHED',
          cycleLength: cycle.users.length,
          score: cycle.score,
          deadline
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
            tradeId: trade.id,
            userId: userId,
            givesItemId: givesEdge.itemId,
            receivesItemId: receivesEdge.itemId
          }
        })
      }

      // Mark matched items as IN_TRADE status (though the enum doesn't have this, let's use TRADED for now)
      const itemIds = cycle.edges.map(edge => edge.itemId)
      await prisma.item.updateMany({
        where: {
          id: { in: itemIds }
        },
        data: {
          status: 'TRADED' // Using TRADED status to indicate items are in a trade
        }
      })

      tradesCreated++
      totalParticipants += cycle.users.length
      console.log(`✅ Created trade with ${cycle.users.length} participants (score: ${cycle.score.toFixed(2)})`)

    } catch (error) {
      console.error('❌ Error creating trade:', error)
    }
  }

  console.log(`🎉 Matching complete! Created ${tradesCreated} trades with ${totalParticipants} total participants`)

  return {
    cyclesFound: allCycles.length,
    tradesCreated,
    participants: totalParticipants
  }
}