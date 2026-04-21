const { User, Course } = require('./src/models');

async function createSampleCourse() {
  try {
    const teacher = await User.findOne({ where: { role: 'teacher' } });
    if (!teacher) {
      console.log('❌ No teacher found. Run create-test-teacher.js first.');
      process.exit(1);
    }

    const course = await Course.create({
      title: 'Introduction to Programming',
      code: 'PROG101',
      description: 'Learn the basics of coding with JavaScript.',
      teacherId: teacher.id,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      isPublished: true,
      enrollmentLimit: 100
    });

    console.log('✅ Sample course created successfully!');
    console.log('   Title:', course.title);
    console.log('   Code:', course.code);
    console.log('   Assigned to:', teacher.email);
    
  } catch (error) {
    console.error('❌ Error creating sample course:', error);
  } finally {
    process.exit(0);
  }
}

createSampleCourse();
