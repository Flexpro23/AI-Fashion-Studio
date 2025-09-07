const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  projectId: 'ai-fashion-studio-demo'
});
const db = getFirestore(app);

async function checkModels() {
  try {
    const snapshot = await db.collection('predefinedModels').get();
    console.log('Total documents:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('No documents found in predefinedModels collection');
      return;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Document ID:', doc.id);
      console.log('Data:', JSON.stringify(data, null, 2));
      
      const requiredFields = ['gender', 'name', 'tags', 'imageUrl'];
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        console.log('MISSING FIELDS:', missingFields);
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}

checkModels();
