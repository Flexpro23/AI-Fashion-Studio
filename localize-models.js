const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  projectId: 'ai-fashion-studio-demo'
});
const db = getFirestore(app);

// Arabic localization mapping
const localizationMap = {
  // Female Models
  'Bella': { name: 'Layla', tags: ['173 cm', 'Slim'] },
  'Maya': { name: 'Fatima', tags: ['168 cm', 'Curvy'] },
  'Sofia': { name: 'Aisha', tags: ['170 cm', 'Athletic'] },
  'Emma': { name: 'Noor', tags: ['165 cm', 'Petite'] },
  'Grace': { name: 'Zahra', tags: ['175 cm', 'Tall'] },
  
  // Male Models
  'Alex': { name: 'Ahmed', tags: ['185 cm', 'Athletic'] },
  'Marcus': { name: 'Youssef', tags: ['180 cm', 'Lean'] },
  'David': { name: 'Khalid', tags: ['183 cm', 'Muscular'] },
  'James': { name: 'Omar', tags: ['178 cm', 'Slim'] },
  'Ryan': { name: 'Hassan', tags: ['188 cm', 'Broad'] }
};

async function localizeModels() {
  try {
    console.log('Starting localization of model data...');
    
    const snapshot = await db.collection('predefinedModels').get();
    console.log(`Found ${snapshot.size} documents to localize`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const currentName = data.name;
      
      if (localizationMap[currentName]) {
        const localizedData = localizationMap[currentName];
        
        console.log(`Localizing ${currentName} → ${localizedData.name}`);
        console.log(`  Tags: ${data.tags?.join(', ')} → ${localizedData.tags.join(', ')}`);
        
        batch.update(doc.ref, {
          name: localizedData.name,
          tags: localizedData.tags
        });
        
        updatedCount++;
      } else {
        console.log(`⚠️  No localization mapping found for: ${currentName}`);
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully localized ${updatedCount} models!`);
    } else {
      console.log('No models were updated.');
    }
    
    // Verify the changes
    console.log('\n📋 Verification of localized data:');
    const verifySnapshot = await db.collection('predefinedModels').get();
    
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`${doc.id}: ${data.name} (${data.gender}) - ${data.tags?.join(', ')}`);
    });
    
    console.log('\n🎉 Localization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error localizing models:', error);
  }
}

localizeModels();
