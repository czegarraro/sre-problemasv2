import axios from 'axios';

async function triggerSync() {
  try {
    const url = 'http://localhost:8080/api/v1/squads/sync';
    console.log(`Triggering sync at: ${url}`);
    const response = await axios.post(url);
    console.log('Response:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

triggerSync();
