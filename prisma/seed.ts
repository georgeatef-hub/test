import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Carol Williams', email: 'carol@example.com' },
    { name: 'David Brown', email: 'david@example.com' },
    { name: 'Eva Davis', email: 'eva@example.com' },
    { name: 'Frank Miller', email: 'frank@example.com' },
  ]

  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 12)
  const createdUsers = []
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        passwordHash: hashedPassword
      }
    })
    createdUsers.push(created)
  }

  // Create a test circle
  console.log('🔵 Creating test circle...')
  const circle = await prisma.circle.create({
    data: {
      name: 'Bay Area Traders',
      description: 'Trading circle for Bay Area residents',
      inviteCode: 'BAYAREA123',
      adminId: createdUsers[0].id, // Alice is admin
      members: {
        create: createdUsers.map(user => ({
          userId: user.id
        }))
      }
    }
  })

  // Create items
  const items = [
    { title: 'iPhone 12', description: 'Good condition, minor scratches', condition: 'GOOD', tags: ['electronics', 'phone'], userEmail: 'alice@example.com' },
    { title: 'MacBook Air', description: 'M1 chip, excellent performance', condition: 'LIKE_NEW', tags: ['electronics', 'laptop'], userEmail: 'bob@example.com' },
    { title: 'Nintendo Switch', description: 'Includes Joy-Con controllers', condition: 'GOOD', tags: ['gaming', 'electronics'], userEmail: 'carol@example.com' },
    { title: 'Wireless Headphones', description: 'Sony WH-1000XM4, noise cancelling', condition: 'LIKE_NEW', tags: ['electronics', 'audio'], userEmail: 'david@example.com' },
    { title: 'iPad Pro', description: '11-inch, with Apple Pencil', condition: 'GOOD', tags: ['electronics', 'tablet'], userEmail: 'eva@example.com' },
    { title: 'The Great Gatsby', description: 'Classic literature, hardcover', condition: 'GOOD', tags: ['books', 'literature'], userEmail: 'frank@example.com' },
    { title: 'Coffee Machine', description: 'Espresso maker with milk frother', condition: 'GOOD', tags: ['kitchen', 'appliance'], userEmail: 'alice@example.com' },
    { title: 'Tennis Racket', description: 'Wilson Pro Staff, excellent grip', condition: 'GOOD', tags: ['sports', 'tennis'], userEmail: 'bob@example.com' },
    { title: 'Electric Guitar', description: 'Fender Stratocaster, sunburst finish', condition: 'GOOD', tags: ['music', 'instrument'], userEmail: 'carol@example.com' },
    { title: 'Board Games', description: 'Collection of classic board games', condition: 'GOOD', tags: ['games', 'entertainment'], userEmail: 'david@example.com' },
  ]

  console.log('📦 Creating items...')
  const createdItems = []
  for (const item of items) {
    const user = createdUsers.find(u => u.email === item.userEmail)
    
    if (user) {
      const created = await prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          condition: item.condition as any,
          tags: item.tags,
          images: ['https://via.placeholder.com/400x300?text=' + encodeURIComponent(item.title)],
          userId: user.id
        }
      })
      createdItems.push(created)
    }
  }

  // Create some RIGHT swipes that form potential cycles
  console.log('👆 Creating swipes...')
  const swipesData = [
    // Create a 3-way cycle: Alice wants Bob's MacBook, Bob wants Carol's Switch, Carol wants Alice's iPhone
    { swiperEmail: 'alice@example.com', itemTitle: 'MacBook Air', direction: 'RIGHT' },
    { swiperEmail: 'bob@example.com', itemTitle: 'Nintendo Switch', direction: 'RIGHT' },
    { swiperEmail: 'carol@example.com', itemTitle: 'iPhone 12', direction: 'RIGHT' },
    
    // Create another potential cycle
    { swiperEmail: 'david@example.com', itemTitle: 'iPad Pro', direction: 'RIGHT' },
    { swiperEmail: 'eva@example.com', itemTitle: 'Electric Guitar', direction: 'RIGHT' },
    { swiperEmail: 'frank@example.com', itemTitle: 'Wireless Headphones', direction: 'RIGHT' },
    
    // Add some additional random RIGHT swipes
    { swiperEmail: 'alice@example.com', itemTitle: 'Tennis Racket', direction: 'RIGHT' },
    { swiperEmail: 'bob@example.com', itemTitle: 'Coffee Machine', direction: 'RIGHT' },
    { swiperEmail: 'carol@example.com', itemTitle: 'Board Games', direction: 'RIGHT' },
    
    // Add some LEFT swipes too
    { swiperEmail: 'alice@example.com', itemTitle: 'The Great Gatsby', direction: 'LEFT' },
    { swiperEmail: 'bob@example.com', itemTitle: 'iPad Pro', direction: 'LEFT' },
  ]

  for (const swipe of swipesData) {
    const swiper = createdUsers.find(u => u.email === swipe.swiperEmail)
    const item = createdItems.find(i => i.title === swipe.itemTitle)
    
    if (swiper && item && swiper.id !== item.userId) {
      await prisma.swipe.create({
        data: {
          userId: swiper.id,
          itemId: item.id,
          circleId: circle.id,
          direction: swipe.direction as any
        }
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`👥 Created ${createdUsers.length} users`)
  console.log(`🔵 Created 1 circle: ${circle.name}`)
  console.log(`📦 Created ${createdItems.length} items`)
  console.log(`👆 Created swipes for potential trade cycles`)
  console.log('')
  console.log('🔑 Test login credentials:')
  console.log('Email: alice@example.com | Password: password123')
  console.log('Email: bob@example.com | Password: password123')
  console.log('(Any of the users can be used with password: password123)')
  console.log('')
  console.log(`🔗 Circle invite code: ${circle.inviteCode}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })