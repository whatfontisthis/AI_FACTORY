const { execSync } = require('child_process');

const envVars = [
  { key: 'TMDB_API_KEY', value: 'cf89ff9422d5d6cb116e16814ceeac0b' },
  { key: 'FIREBASE_PROJECT_ID', value: 'cine-log-2377a' },
  { key: 'FIREBASE_CLIENT_EMAIL', value: 'firebase-adminsdk-fbsvc@cine-log-2377a.iam.gserviceaccount.com' },
  { key: 'FIREBASE_PRIVATE_KEY', value: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCu5obMm1CQdbLS\\n1sGz70wcrGJHot5FeaY4dVr+IgS/0SPqbnYpu/5JgmXmTrRpEJrpJrELuoTHFEcZ\\nwZbyp//LmJmarFTxMWZHy3kkIH1vjeboQhX88Z7tvEZtiAnqW7v/xGCTxIuwTqdX\\n8Wr2HEqHvs96kkejVBbvSk/pwb93dC8WV1yfqF/shK7JUnhKJ+8RQabLQB0HxcRY\\nbqiP9v0BoYTMEEqKPiG2jXnmIUjWVqbVA6opuCl9Ta0XvbEJzt6M+/Hlu24lGQll\\nwtmIaMUTP+hVYoKVnX//KnRovFsX4wout+maVAf+5W92r5xYwArhUDnrtkNyISXx\\nTXlMLqJxAgMBAAECggEAPKisIMNPLkL72b7s4GSCn8EztseoUi0uNo+RFumifwpg\\na/qSlcfjGgiVIcqzLGs7Zthp9/jg+xCv1iF7oj4c67ZJs8jIDvzEjermYV65UlrD\\nNlNRP/Bm3+n3/R383mChc8PegPFeRzAIPup2X9QRD0JgwBCCswVDjQtXaums55b7\\nweUxjC+2HsyWe1Gv3HwHrMIrzPIdlNq/N9/l7GVvApxMXDtx9qR4lgJxAtTNEN7j\\n7/0T7TO4afYV3WCQvthp2ZbsfCZ2yWJGTNL1i8WnZptmQMbznrkdtrwZANj5lmJC\\nFY9SW+8e62SlzTY7qH84MtTd8E8LXD6JVEUA6sgvTwKBgQDWXizSMFY4iwp8KsbM\\nns1dw6nwDO9eNImEhUBaL8UvXdsOsaFP5U56/I+7hQXZVMx4mTKEZV1uiQ3PPgYi\\n9nP7qVqBHjKFhy5kwSznWPaUL9NTSLP3fh1Iur1wr+DuILgKjyuJKG43TyIQKngP\\nyS29d1L/MigZigErrDCm9y4dqwKBgQDQ3iJKlMomobUQ03fRVJ6TqNAEMnFER497\\nNnqZABnjOA2tTWfrsRnOQ+B7gLf2e/iDm5dB154xmGxP3Asod+iLDMEGyJJRzBDL\\nS8qxD4fHrcDJA7m6gbIvN0ug7iLyHfb5vv1iSJR7WPKw7VlmsrDJ8oGJh4JDNhIp\\nsF77v4UMUwKBgQDEM3fUfTc9E01qbgB8YdBXRHFya3Rehblj2E4Y/WX9v2pynXOm\\nW5skB6tKFytOSkXHD3hkIx6Lv9cq2nrlXyqyqMNUMB5PhnWY9BG0QQGWidtie8Vz\\n/TKyUXB4BhHaAYpQ588R/zY5Wy0zHJu83wYFRoRpXC/FiEEgBr6U4uGLdwKBgQDJ\\nAIylk2y7IrGaQLe09qco2LNe5qBEIk29OF9hMEy5cq8O0Ugp9KQt8PpuQCBJj2JI\\nXQqCLZsqhVHuxIbkagibECoOeiT9nNGoowarwJNdoSO/DtvE1Z2BfMhGVgXBVP7h\\nt2AnHkvuLFpZ1ABOKbaikcMBdCvyvG1cO0QdJ2FFywKBgFgFxVQwHoVYIPTgs1RV\\nADUe6KTXTbPfXo1Fcd62e7hv2MFEN7jyJHZ80/oCqq1dSRq54yYymoxmBjfpEimS\\nlhaUaecrZxhx1VPxwK0+BgQi3p7pE9GAQYXI+mmMuULGjY+ue2kwOlL3SjYC2GtN\\n+nWwsefUkMQDTkLzzsUcAUXD\\n-----END PRIVATE KEY-----\\n' }
];

envVars.forEach((envVar, index) => {
  console.log(`Adding ${envVar.key} (${index + 1}/${envVars.length})...`);
  try {
    execSync(`vercel env add ${envVar.key} "${envVar.value}" -y`, { stdio: 'inherit' });
    console.log(`✅ ${envVar.key} added`);
  } catch (error) {
    console.error(`❌ Failed to add ${envVar.key}:`, error.message);
  }
});

console.log('\\n✅ Environment variables added! Now deploying...');
execSync('vercel --prod --yes', { stdio: 'inherit' });
