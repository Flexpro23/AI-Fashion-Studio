const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = initializeApp({
  projectId: 'ai-fashion-studio-demo'
});
const db = getFirestore(app);

// Model names and tags based on gender
const modelData = {
  male: [
    { name: "Alex", tags: ["6'1\"", "Athletic", "Caucasian"] },
    { name: "Marcus", tags: ["5'11\"", "Lean", "African American"] },
    { name: "David", tags: ["6'0\"", "Muscular", "Hispanic"] },
    { name: "James", tags: ["5'10\"", "Slim", "Asian"] },
    { name: "Ryan", tags: ["6'2\"", "Broad", "Caucasian"] }
  ],
  female: [
    { name: "Bella", tags: ["5'8\"", "Slim", "Caucasian"] },
    { name: "Maya", tags: ["5'6\"", "Curvy", "African American"] },
    { name: "Sofia", tags: ["5'7\"", "Athletic", "Hispanic"] },
    { name: "Emma", tags: ["5'5\"", "Petite", "Asian"] },
    { name: "Grace", tags: ["5'9\"", "Tall", "Caucasian"] }
  ]
};

async function fixModels() {
  try {
    const snapshot = await db.collection('predefinedModels').get();
    console.log('Found', snapshot.size, 'documents to fix');
    
    let maleIndex = 0;
    let femaleIndex = 0;
    
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Fixing document:', doc.id);
      
      let modelInfo;
      if (data.gender === 'male') {
        modelInfo = modelData.male[maleIndex % modelData.male.length];
        maleIndex++;
      } else {
        modelInfo = modelData.female[femaleIndex % modelData.female.length];
        femaleIndex++;
      }
      
      const updatedData = {
        gender: data.gender,
        name: modelInfo.name,
        tags: modelInfo.tags,
        imageUrl: data.image // Rename 'image' to 'imageUrl'
      };
      
      // Remove the old 'image' field
      batch.update(doc.ref, updatedData);
      batch.update(doc.ref, { image: FieldValue.delete() });
      
      console.log('Updated:', doc.id, 'with name:', modelInfo.name);
    });
    
    await batch.commit();
    console.log('Successfully updated all documents!');
    
    // Verify the changes
    const verifySnapshot = await db.collection('predefinedModels').get();
    console.log('\nVerification:');
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`${doc.id}: ${data.name} (${data.gender}) - ${data.tags?.join(', ')}`);
      
      const requiredFields = ['gender', 'name', 'tags', 'imageUrl'];
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        console.log('  STILL MISSING:', missingFields);
      } else {
        console.log('  ✓ All fields present');
      }
    });
    
  } catch (error) {
    console.error('Error fixing documents:', error);
  }
}

fixModels();
