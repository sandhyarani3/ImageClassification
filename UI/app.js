const dropzone = document.getElementById('dropzone');
const resultContainer = document.getElementById('result-container');
const predictedName = document.getElementById('predicted-name');
const tableBody = document.querySelector('#prob-table tbody');

dropzone.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => uploadImage(input.files[0]);
  input.click();
});

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.style.borderColor = '#0099ff';
});

dropzone.addEventListener('dragleave', e => {
  dropzone.style.borderColor = '#555';
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.borderColor = '#555';
  if (e.dataTransfer.files.length > 0) {
    uploadImage(e.dataTransfer.files[0]);
  }
});

function uploadImage(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const base64 = reader.result;
    fetch('http://127.0.0.1:5000/classify_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `image_data=${encodeURIComponent(base64)}`
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const res = data[0];
          predictedName.innerHTML = `Predicted Person: <span style="color: green;">${res.class}</span>`;
          tableBody.innerHTML = '';

          const classDict = res.class_dictionary;
          const probs = res.class_probability;

          const classNamesByIndex=Object.entries(classDict).reduce(
            (acc,[person,index])=>{
              acc[index]=person;
              return acc;
            },[]
          )

          classNamesByIndex.forEach((person, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${person}</td>
              <td>${probs[index].toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
          });

          resultContainer.style.display = 'block';
        } else {
          predictedName.innerHTML = 'No valid face detected or unknown person.';
          tableBody.innerHTML = '';
          resultContainer.style.display = 'block';
        }
      })
      .catch(err => {
        console.error(err);
        predictedName.innerHTML = 'Error during prediction.';
        tableBody.innerHTML = '';
        resultContainer.style.display = 'block';
      });
  };
  reader.readAsDataURL(file);
}
