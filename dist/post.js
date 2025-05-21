// Show a message in the UI or as an alert
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('formMessage');
  if (messageDiv) {
      messageDiv.textContent = text;
      messageDiv.className = `mt-4 p-4 rounded-md text-center font-bold ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`;
      messageDiv.style.display = 'block';
      setTimeout(() => {
          messageDiv.style.display = 'none';
      }, 10000); // Show for 10 seconds
  } else {
      alert(text);
      console.error('formMessage div not found');
  }
  console.log('Message displayed:', text);
}

// Send post data to the API
async function createPost(formData) {
  try {
      const apiUrl = 'https://test.blockfuselabs.com/api/posts'; // UPDATE THIS!
      const authToken = localStorage.getItem('authToken') || 'your-auth-token-here';

      // Log payload
      const payload = {};
      formData.forEach((value, key) => {
          payload[key] = value;
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

      if (!response.ok) {
          const text = await response.text();
          let errorMessage = `Error: ${response.status} ${response.statusText}`;
          try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
              errorMessage = text || errorMessage;
          }
          console.log('Error body:', text);
          throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Response:', result);
      return { success: true };
  } catch (error) {
      console.error('API Error:', error.message);
      return { success: false, error: error.message };
  }
}

// Handle form submission
document.getElementById('postForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get form data
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const content = document.getElementById('content').value.trim();
  const categoryId = document.getElementById('categoryId').value;

  // Set date (UTC, adjusted from WAT)
  const postDateTime = new Date().toISOString(); // E.g., "2025-05-21T23:29:00.000Z"

  // Validate
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
  if (!categoryId || !Number.isInteger(Number(categoryId)) || Number(categoryId) < 1) {
      showMessage('Category ID must be a positive number.', true);
      return;
  }

  // Create FormData (no featuredImage for now)
  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  formData.append('content', content);
  formData.append('category_id', categoryId); // Changed to category_id
  formData.append('date', postDateTime);

  // Show loading
  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  // Send to API
  const result = await createPost(formData);

  // Reset button
  submitButton.disabled = false;
  submitButton.textContent = 'Submit';

  // Show result
  if (result.success) {
      showMessage('Post created!');
      document.getElementById('postForm').reset();
      document.getElementById('fileName').textContent = 'Choose from library';
  } else {
      showMessage(`Error: ${result.error}`, true);
  }
});

// Update image file name display (still handle UI for featuredImage)
document.getElementById('featuredImage')?.addEventListener('change', (event) => {
  const fileNameSpan = document.getElementById('fileName');
  if (fileNameSpan) {
      fileNameSpan.textContent = event.target.files[0]?.name || 'Choose from library';
  }
});