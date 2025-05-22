
document.getElementById('featuredImage')?.addEventListener('change', (event) => {
  const fileNameSpan = document.getElementById('fileName');
  const file = event.target.files[0];
  fileNameSpan.textContent = file ? file.name : 'Choose image';
});


function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('formMessage');
  if (messageDiv) {
      messageDiv.textContent = text;
      messageDiv.className = `mt-4 p-4 rounded-md text-center font-bold ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`;
      messageDiv.style.display = 'block';
      setTimeout(() => {
          messageDiv.style.display = 'none';
      }, 10000);
  } else {
      alert(text);
      console.error('formMessage div not found');
  }
  console.log('Message:', text);
}


function saveResponseToFile(content, filename = 'response.html') {
  try {
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`Saved response to ${filename}`);
  } catch (e) {
      console.error('Failed to save response:', e);
  }
}

async function createPost(formData, apiUrl = 'https://test.blockfuselabs.com/api/posts') {
  try {
      const authToken = localStorage.getItem('authToken') || 'your-auth-token-here';

     
      const payload = {};
      formData.forEach((value, key) => {
          payload[key] = value instanceof File ? value.name : value;
      });
      console.log('Sending:', { url: apiUrl, payload, authToken });

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${authToken}`
          },
          body: formData
      });

      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers));

     
      const text = await response.text();
      console.log('Raw response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

    
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
          saveResponseToFile(text, `error_response_${Date.now()}.html`);
      }

      if (!response.ok) {
          let errorMessage = `Error: ${response.status} ${response.statusText}`;
          try {
              if (contentType.includes('application/json')) {
                  const errorData = JSON.parse(text);
                  errorMessage = errorData.error || errorData.message || errorMessage;
              } else {
                  errorMessage = `Unexpected HTML response: ${text.substring(0, 100)}... (saved to file)`;
              }
          } catch {
              errorMessage = `Failed to parse response: ${text.substring(0, 100)}... (saved to file)`;
          }
          throw new Error(errorMessage);
      }

      if (!contentType.includes('application/json')) {
          throw new Error('Unexpected non-JSON response');
      }
      const result = JSON.parse(text);
      console.log('Response JSON:', result);
      return { success: true, data: result };
  } catch (error) {
      console.error('API Error:', error.message);
      return { success: false, error: error.message };
  }
}


document.getElementById('postForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();


  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const content = document.getElementById('content').value.trim();
  const categoryId = document.getElementById('categoryId').value;
  const imageInput = document.getElementById('featuredImage');
  const featuredImage = imageInput.files[0];

  
  const postDateTime = new Date().toISOString(); 


  if (!title) {
      showMessage('Enter a title.', true);
      return;
  }
  if (!author) {
      showMessage('Enter an author.', true);
      return;
  }
  if (!content) {
      showMessage('Enter content.', true);
      return;
  }
  if (!categoryId) {
      showMessage('Select a category.', true);
      return;
  }
  if (featuredImage && featuredImage.size > 2 * 1024 * 1024) {
      showMessage('Image must be less than 2MB.', true);
      return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  formData.append('content', content);
  formData.append('category_id', categoryId);
  formData.append('date', postDateTime);
 

  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  let result = await createPost(formData);


  if (!result.success && result.error.includes('500')) {
      console.log('Retrying with fallback endpoint...');
      const fallbackUrl = 'https://test.blockfuselabs.com/api/v1/posts';
      result = await createPost(formData, fallbackUrl);
  }

 
  submitButton.disabled = false;
  submitButton.textContent = 'Submit';

  if (result.success) {
      showMessage(`Post created! ID: ${result.data.id || 'Unknown'}`);
      document.getElementById('postForm').reset();
      document.getElementById('fileName').textContent = 'Choose image';
  } else {
      showMessage(`Error: ${result.error}`, true);
  }
});