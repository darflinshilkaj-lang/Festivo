const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Event = require('./models/Event');

const sampleEvents = [
  {
    title: 'Tech Symposium 2026',
    description: 'Explore AI, robotics, and startup talks from industry experts and student innovators. Features paper presentation, project expo, and tech quiz.',
    college: 'IIT Madras',
    eventType: 'Technical Symposium',
    date: new Date('2026-09-20'),
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venue: 'Innovation Hall, Academic Block',
    organizer: 'CSE & EEE Department',
    registrationLimit: 250,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    fee: 250,
    isFree: false,
    rules: [
      'Teams must consist of a maximum of 3 members.',
      'Participants must bring their own laptops.',
      'Plagiarism of code will lead to immediate disqualification.',
      'Decisions of the judges will be final.'
    ],
    coordinator: 'Priya Iyer',
    phone: '+91 9876123450'
  },
  {
    title: 'Code Clash 2026',
    description: 'A fast-paced competitive programming contest to test your data structures, algorithms, and problem-solving speed under pressure.',
    college: 'NIT Trichy',
    eventType: 'Technical',
    date: new Date('2026-09-25'),
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    venue: 'Computer Lab 3',
    organizer: 'Coding Club NIT Trichy',
    registrationLimit: 150,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    fee: 0,
    isFree: true,
    rules: [
      'Individual participation only.',
      'Languages supported: C++, Java, Python, JavaScript.',
      'Internet usage during contest is strictly restricted.'
    ],
    coordinator: 'Arun Kumar',
    phone: '+91 9876543211'
  },
  {
    title: 'AI & ML Workshop 2026',
    description: 'Hands-on practical workshop covering Deep Learning, Neural Networks, and Generative AI applications with real-world case studies.',
    college: 'Anna University',
    eventType: 'Workshop',
    date: new Date('2026-10-05'),
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'Seminar Hall B',
    organizer: 'Department of Information Technology',
    registrationLimit: 100,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    fee: 300,
    isFree: false,
    rules: [
      'Pre-requisite: Basic Python knowledge.',
      'Participants will receive e-certificates post completion.',
      'Bring laptop with Python 3.10+ installed.'
    ],
    coordinator: 'Sanjay Reddy',
    phone: '+91 9944556677'
  },
  {
    title: 'Cultural Fest 2026',
    description: 'An evening of dance, drama, fashion, live music, and street art designed to celebrate artistic talent from colleges across the nation.',
    college: 'Anna University',
    eventType: 'Cultural Event',
    date: new Date('2026-10-15'),
    startTime: '05:30 PM',
    endTime: '10:00 PM',
    venue: 'Main Campus Quadrangle',
    organizer: 'Festivo Cultural Union',
    registrationLimit: 500,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    fee: 0,
    isFree: true,
    rules: [
      'College ID card is mandatory for entry.',
      'Outside food and drinks prohibited.',
      'Adhere to slot timing for stage performances.'
    ],
    coordinator: 'Rahul Nair',
    phone: '+91 9944556688'
  },
  {
    title: 'Inter-College Hackathon 2026',
    description: '24-hour non-stop hackathon building innovative solutions for Smart Cities, Healthcare, EdTech, and Sustainability.',
    college: 'BITS Pilani',
    eventType: 'Hackathon',
    date: new Date('2026-11-01'),
    startTime: '10:00 AM',
    endTime: '10:00 AM (Next Day)',
    venue: 'Tech Innovation Hub',
    organizer: 'Entrepreneurship Cell',
    registrationLimit: 200,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    fee: 150,
    isFree: false,
    rules: [
      'Teams of 2 to 4 members.',
      'Fresh codebase required; no pre-built projects allowed.',
      'Mentors will evaluate at 12-hour mark.'
    ],
    coordinator: 'Kavita Sundaram',
    phone: '+91 9003322110'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Seeding Festivo events...');

    // Clear existing events to prevent unwanted duplicates
    await Event.deleteMany({});
    console.log('Existing events cleared.');

    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Successfully seeded ${createdEvents.length} events into MongoDB Atlas.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
};

seedDatabase();
