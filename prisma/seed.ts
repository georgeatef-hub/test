import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Books', icon: '📚' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Home & Garden', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Music', icon: '🎵' },
    { name: 'Games', icon: '🎮' },
    { name: 'Other', icon: '📦' }
  ]

  console.log('📂 Creating categories...')
  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
  }

  // Create users
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com', city: 'San Francisco', lat: 37.7749, lon: -122.4194 },
    { name: 'Bob Smith', email: 'bob@example.com', city: 'Oakland', lat: 37.8044, lon: -122.2712 },
    { name: 'Carol Williams', email: 'carol@example.com', city: 'Berkeley', lat: 37.8715, lon: -122.2730 },
    { name: 'David Brown', email: 'david@example.com', city: 'San Jose', lat: 37.3382, lon: -121.8863 },
    { name: 'Eva Davis', email: 'eva@example.com', city: 'Palo Alto', lat: 37.4419, lon: -122.1430 },
    { name: 'Frank Miller', email: 'frank@example.com', city: 'Santa Clara', lat: 37.3541, lon: -121.9552 },
    { name: 'Grace Wilson', email: 'grace@example.com', city: 'Mountain View', lat: 37.3860, lon: -122.0838 },
    { name: 'Henry Garcia', email: 'henry@example.com', city: 'Fremont', lat: 37.5485, lon: -121.9886 },
    { name: 'Ivy Martinez', email: 'ivy@example.com', city: 'Sunnyvale', lat: 37.3688, lon: -122.0363 },
    { name: 'Jack Taylor', email: 'jack@example.com', city: 'Cupertino', lat: 37.3230, lon: -122.0322 }
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
        passwordHash: hashedPassword,
        latitude: user.lat,
        longitude: user.lon
      }
    })
    createdUsers.push(created)
  }

  // Create items
  const items = [
    // Electronics
    { title: 'iPhone 12', description: 'Good condition, minor scratches', condition: 'Good', categoryName: 'Electronics', userEmail: 'alice@example.com', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400' },
    { title: 'MacBook Air', description: 'M1 chip, excellent performance', condition: 'Like New', categoryName: 'Electronics', userEmail: 'bob@example.com', imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400' },
    { title: 'Nintendo Switch', description: 'Includes Joy-Con controllers', condition: 'Good', categoryName: 'Electronics', userEmail: 'carol@example.com', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
    { title: 'Wireless Headphones', description: 'Sony WH-1000XM4, noise cancelling', condition: 'Like New', categoryName: 'Electronics', userEmail: 'david@example.com', imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400' },
    { title: 'iPad Pro', description: '11-inch, with Apple Pencil', condition: 'Good', categoryName: 'Electronics', userEmail: 'eva@example.com', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
    
    // Books
    { title: 'The Great Gatsby', description: 'Classic literature, hardcover', condition: 'Good', categoryName: 'Books', userEmail: 'frank@example.com', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
    { title: 'Programming Book Set', description: '5 books on web development', condition: 'Like New', categoryName: 'Books', userEmail: 'grace@example.com', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { title: 'Cookbook Collection', description: 'Mediterranean cuisine recipes', condition: 'Good', categoryName: 'Books', userEmail: 'henry@example.com', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
    { title: 'Science Fiction Novels', description: 'Isaac Asimov Foundation series', condition: 'Fair', categoryName: 'Books', userEmail: 'ivy@example.com', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
    { title: 'Art History Book', description: 'Renaissance period focus', condition: 'Good', categoryName: 'Books', userEmail: 'jack@example.com', imageUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400' },
    
    // Clothing
    { title: 'Designer Jacket', description: 'North Face winter jacket, size M', condition: 'Like New', categoryName: 'Clothing', userEmail: 'alice@example.com', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { title: 'Vintage Jeans', description: "Levi's 501, size 32", condition: 'Good', categoryName: 'Clothing', userEmail: 'bob@example.com', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
    { title: 'Formal Dress', description: 'Black evening dress, size S', condition: 'Like New', categoryName: 'Clothing', userEmail: 'carol@example.com', imageUrl: 'https://images.unsplash.com/photo-1566479179817-c08cbf03a3aa?w=400' },
    { title: 'Athletic Shoes', description: 'Nike running shoes, size 10', condition: 'Good', categoryName: 'Clothing', userEmail: 'david@example.com', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { title: 'Wool Sweater', description: 'Handknitted, very warm', condition: 'Good', categoryName: 'Clothing', userEmail: 'eva@example.com', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' },
    
    // Home & Garden
    { title: 'Coffee Machine', description: 'Espresso maker with milk frother', condition: 'Good', categoryName: 'Home & Garden', userEmail: 'frank@example.com', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
    { title: 'Plant Collection', description: '5 indoor plants with pots', condition: 'New', categoryName: 'Home & Garden', userEmail: 'grace@example.com', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { title: 'Kitchen Knife Set', description: 'Professional chef knives', condition: 'Like New', categoryName: 'Home & Garden', userEmail: 'henry@example.com', imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400' },
    { title: 'Garden Tools', description: 'Shovel, rake, and pruning shears', condition: 'Good', categoryName: 'Home & Garden', userEmail: 'ivy@example.com', imageUrl: 'https://images.unsplash.com/photo-1416472263341-61b76b22ef43?w=400' },
    { title: 'Dining Table', description: 'Wooden table seats 6 people', condition: 'Good', categoryName: 'Home & Garden', userEmail: 'jack@example.com', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    
    // Sports
    { title: 'Tennis Racket', description: 'Wilson Pro Staff, excellent grip', condition: 'Good', categoryName: 'Sports', userEmail: 'alice@example.com', imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400' },
    { title: 'Basketball', description: 'Official size and weight', condition: 'Good', categoryName: 'Sports', userEmail: 'bob@example.com', imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400' },
    { title: 'Yoga Mat', description: 'Non-slip surface, 6mm thick', condition: 'Like New', categoryName: 'Sports', userEmail: 'carol@example.com', imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400' },
    { title: 'Bicycle', description: 'Mountain bike, 21 speeds', condition: 'Good', categoryName: 'Sports', userEmail: 'david@example.com', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { title: 'Golf Clubs', description: 'Half set with bag', condition: 'Fair', categoryName: 'Sports', userEmail: 'eva@example.com', imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400' },
    
    // Music
    { title: 'Electric Guitar', description: 'Fender Stratocaster, sunburst finish', condition: 'Good', categoryName: 'Music', userEmail: 'frank@example.com', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400' },
    { title: 'Keyboard Piano', description: '88 keys, weighted action', condition: 'Like New', categoryName: 'Music', userEmail: 'grace@example.com', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400' },
    { title: 'Vinyl Records', description: 'Classic rock collection, 20 albums', condition: 'Good', categoryName: 'Music', userEmail: 'henry@example.com', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
    { title: 'Audio Interface', description: 'Focusrite Scarlett 2i2', condition: 'Like New', categoryName: 'Music', userEmail: 'ivy@example.com', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400' },
    { title: 'Drum Kit', description: 'Complete 5-piece set with cymbals', condition: 'Good', categoryName: 'Music', userEmail: 'jack@example.com', imageUrl: 'https://images.unsplash.com/photo-1571327073757-71d13c24de30?w=400' },
    
    // Games
    { title: 'Board Game Collection', description: 'Settlers of Catan, Monopoly, and more', condition: 'Good', categoryName: 'Games', userEmail: 'alice@example.com', imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400' }
  ]

  console.log('📦 Creating items...')
  const createdItems = []
  for (const item of items) {
    const category = createdCategories.find(c => c.name === item.categoryName)
    const user = createdUsers.find(u => u.email === item.userEmail)
    
    if (category && user) {
      const created = await prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          condition: item.condition,
          images: item.imageUrl ? [item.imageUrl] : [],
          userId: user.id,
          categoryId: category.id
        }
      })
      createdItems.push(created)
    }
  }

  // Create wants that form potential cycles
  console.log('💭 Creating wants...')
  const wantsData = [
    // Create a 3-way cycle: Alice wants Bob's MacBook, Bob wants Carol's Switch, Carol wants Alice's iPhone
    { wanterEmail: 'alice@example.com', itemTitle: 'MacBook Air' }, // Alice wants Bob's MacBook
    { wanterEmail: 'bob@example.com', itemTitle: 'Nintendo Switch' }, // Bob wants Carol's Switch
    { wanterEmail: 'carol@example.com', itemTitle: 'iPhone 12' }, // Carol wants Alice's iPhone
    
    // Create another cycle: David wants Eva's iPad, Eva wants Frank's Guitar, Frank wants David's Headphones
    { wanterEmail: 'david@example.com', itemTitle: 'iPad Pro' }, // David wants Eva's iPad
    { wanterEmail: 'eva@example.com', itemTitle: 'Electric Guitar' }, // Eva wants Frank's Guitar
    { wanterEmail: 'frank@example.com', itemTitle: 'Wireless Headphones' }, // Frank wants David's Headphones
    
    // Create a 4-way cycle: Grace wants Henry's Cookbook, Henry wants Ivy's Audio Interface, Ivy wants Jack's Drum Kit, Jack wants Grace's Piano
    { wanterEmail: 'grace@example.com', itemTitle: 'Cookbook Collection' },
    { wanterEmail: 'henry@example.com', itemTitle: 'Audio Interface' },
    { wanterEmail: 'ivy@example.com', itemTitle: 'Drum Kit' },
    { wanterEmail: 'jack@example.com', itemTitle: 'Keyboard Piano' },
    
    // Add some additional random wants
    { wanterEmail: 'alice@example.com', itemTitle: 'Yoga Mat' },
    { wanterEmail: 'bob@example.com', itemTitle: 'Tennis Racket' },
    { wanterEmail: 'carol@example.com', itemTitle: 'Coffee Machine' },
    { wanterEmail: 'david@example.com', itemTitle: 'Programming Book Set' },
    { wanterEmail: 'eva@example.com', itemTitle: 'Designer Jacket' }
  ]

  for (const want of wantsData) {
    const wanter = createdUsers.find(u => u.email === want.wanterEmail)
    const item = createdItems.find(i => i.title === want.itemTitle)
    
    if (wanter && item && wanter.id !== item.userId) {
      await prisma.want.create({
        data: {
          userId: wanter.id,
          itemId: item.id
        }
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`📂 Created ${createdCategories.length} categories`)
  console.log(`👥 Created ${createdUsers.length} users`)
  console.log(`📦 Created ${createdItems.length} items`)
  console.log(`💭 Created wants for potential trade cycles`)
  console.log('')
  console.log('🔑 Test login credentials:')
  console.log('Email: alice@example.com | Password: password123')
  console.log('Email: bob@example.com | Password: password123')
  console.log('Email: carol@example.com | Password: password123')
  console.log('(Any of the users can be used with password: password123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })