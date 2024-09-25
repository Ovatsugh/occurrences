
const routes = {
  '/dashboard': '../pages/dashboard/index.html',
  '/occurence': '../pages/occurence/index.html',
  '/statistics': '../pages/statistics/index.html',
  '/login': '../pages/login/index.html'
};


document.addEventListener('DOMContentLoaded', () => {

  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    var loginDiv = document.getElementById('login');

    if (loginDiv) {
      loginDiv.removeAttribute('style');
    }

    fetch('../components/sidebar/index.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('sidebar').innerHTML = data;
      })
      .catch(error => console.error('Erro ao carregar a sidebar:', error));
    loadPage(window.location.pathname);
  } else if (window.location.pathname == '/login') {
    fetch('../pages/login/index.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('login').innerHTML = data;
      })

  } else if (window.location.pathname == '/') {



    let coordinates = { lat: null, lng: null }; // Objeto para armazenar as coordenadas

    fetch('../pages/userDashboard/index.html')
      .then(response => response.text())
      .then(data => {

        document.getElementById('login').innerHTML = data;

        document.getElementById('searchButton').addEventListener('click', function () {

          const searchValue = document.getElementById('searchInput').value;
          const tbody = document.getElementById('occurence-table-body');
          tbody.innerHTML = '';

          const row = document.createElement('tr');



          fetch('http://localhost:5000/occurences')
            .then(response => {
              return response.json(); 
            })
            .then(data => {
            
              const result = data.find(item => item.id == searchValue);
              if (result.status == 1) {
                result.status = "em análise"
              } else if (result.status == 2) {
                result.status = "indeferida"
              } else if (result.status == 3) {
                result.status = "resolvida"
              }

              row.innerHTML = `
              <th scope="row">${result.id}</th>
              <td >${result.title}</td>
              <td>${result.description}</td>
              <td>${result.status}</td>
              <td> <button type="button" class="btn btn-primary" onclick='getSearchId(${JSON.stringify(result)})'  data-toggle="modal" data-target="#myModal">
           ver
        </button></td>`;
              tbody.appendChild(row); // Adiciona a nova linha ao tbo

            })
            .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
            });

        });
        const address = document.getElementById('address');
        var map = L.map('map').setView([-5.3404526, -49.0850137], 14);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        let lastMarker; // Variável para armazenar a referência ao último marcador

        map.on('click', function (e) {
          coordinates.lat = e.latlng.lat; // Latitude
          coordinates.lng = e.latlng.lng; // Longitude
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`;

          fetch(url)
            .then(response => response.json())
            .then(data => {
              if (data && data.display_name) {
                address.value = data.display_name;
                console.log("Endereço:", data.display_name);
              } else {
                console.log("Endereço não encontrado.");
              }
            })
            .catch(error => {
              console.error("Erro ao obter o endereço:", error);
            });

          console.log("Coordenadas clicadas: ", coordinates.lat, coordinates.lng);

          // Remove o marcador anterior, se existir
          if (lastMarker) {
            map.removeLayer(lastMarker);
          }

          // Adiciona um novo marcador
          lastMarker = L.marker([coordinates.lat, coordinates.lng]).addTo(map)
            .bindPopup("Você clicou aqui: " + coordinates.lat.toFixed(5) + ", " + coordinates.lng.toFixed(5))
            .openPopup();
        });

        document.getElementById('occurrenceForm').addEventListener('submit', function (event) {
          event.preventDefault(); // Impede o envio do formulário

          // Obtém os valores dos campos
          const title = document.getElementById('title').value;
          const addressValue = document.getElementById('address').value;
          const description = document.getElementById('description').value;

          // Verifica se as coordenadas foram definidas
          if (coordinates.lat !== null && coordinates.lng !== null) {
            const data = { title, address: addressValue, description, status: 1, coordenadas: { latitude: coordinates.lat, longitude: coordinates.lng } };


            fetch('http://localhost:5000/occurences', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data), // Enviar o objeto diretamente
            })
              .then(response => response.json()).then((res) => {
                location.reload();
                console.log(res.id)
                window.alert(`Ocorrência cadastrada com sucesso, anote seu código ${res.id} !`)
              })
              .catch((error) => {
                console.error('Error:', error);
              });
          } else {
            console.error("Coordenadas não definidas.");
            window.alert(`Coordenadas não definidas !`)
          }
        });
      });


  }
});




// aqui fica minhas funções (n aguento mais ;/ )

function loadPage(path) {
  const contentDiv = document.getElementById('content');
  const route = routes[path] || routes['/'];

  fetch(route)
    .then(response => response.text())
    .then(data => {
      contentDiv.innerHTML = data;
      if (path === '/dashboard') {
        const openModalButton = document.querySelector('.btn-primary');

        // Adiciona um evento de clique
        openModalButton.addEventListener('click', () => {
          $('#myModal').modal('show'); // Usando jQuery para abrir o modal
        });

        getDataOccurences(document)
      }

      if (path === '/statistics') {
        initializeMap();
      }

      if (path === '/occurence') {

        getDataForm(document)
      }
    })
    .catch(error => console.error('Erro ao carregar a página:', error));
}



function getDataForm(document) {


  fetch('http://localhost:5000/users')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const tbody = document.getElementById('user-table-body');
      tbody.innerHTML = ''; // Limpa o conteúdo anterior

      data.forEach((user) => {
        console.log(user)
        const row = document.createElement('tr');

        if (user.tipoUsuario == 1) {
          user.tipoUsuario = 'Admin'
        } else {
          user.tipoUsuario = 'Cidadão'
        }
        row.innerHTML = `
            <th scope="row">${user.id}</th>
            <td >${user.name}</td>
            <td>${user.sobrenome}</td>
            <td>${user.tipoUsuario}</td>
        `;

        tbody.appendChild(row); // Adiciona a nova linha ao tbody
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

  const form = document.getElementById('userForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();


    const name = document.getElementById('nameId').value;
    const sobrenome = document.getElementById('sobrenomeId').value;
    const telefone = document.getElementById('telefoneId').value;
    const senha = document.getElementById('senhaId').value;
    const confirmsenha = document.getElementById('confirmsenhaId').value;
    const tipoUsuario = document.getElementById('tipoUsuarioId').value;


    fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        sobrenome,
        telefone,
        senha,
        tipoUsuario
      }),
    }).then(() => {
      location.reload()
    })
      .catch((error) => {
        console.error('Error:', error);
      });
  });

}


async function initializeMap() {

  var map = L.map('map').setView([-5.3404526, -49.0850137], 14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);


  fetch('http://localhost:5000/occurences')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // ou response.text() dependendo do que sua API retorna
    })
    .then(data => {
      data.forEach(marker => {
        console.log(marker.coordenadas)
        L.marker([marker.coordenadas.latitude, marker.coordenadas.longitude]).addTo(map).bindPopup(marker.title);
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

}

function getDataOccurences(document) {
  fetch('http://localhost:5000/occurences')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data)
      localStorage.setItem('ocorrencias', JSON.stringify(data));
      const tbody = document.getElementById('occurence-table-body');
      const analise = document.getElementById('analise')
      const indeferidas = document.getElementById('indeferidas')
      const resolvidas = document.getElementById('resolvidas')
      tbody.innerHTML = ''; // Limpa o conteúdo anterior

      const statusOneOccurrences = data.filter(occurence => occurence.status == 1).length || 0
      const statusTwoOccurrences = data.filter(occurence => occurence.status == 2).length || 0
      const statusThreeOccurrences = data.filter(occurence => occurence.status == 3).length || 0

      analise.textContent = statusOneOccurrences
      indeferidas.textContent = statusTwoOccurrences
      resolvidas.textContent = statusThreeOccurrences



      data.forEach((occurence) => {
        if (occurence.status == 1) {
          occurence.status = "em análise"
        } else if (occurence.status == 2) {
          occurence.status = "indeferida"
        } else if (occurence.status == 3) {
          occurence.status = "resolvida"
        }

        const row = document.createElement('tr');


        row.innerHTML = `
          <th scope="row">${occurence.id}</th>
          <td >${occurence.title}</td>
          <td>${occurence.description}</td>
          <td>${occurence.status}</td>
          <td> <button type="button" class="btn btn-primary" onclick="getId(${occurence.id})" data-toggle="modal" data-target="#myModal">
       ver
    </button></td>`;

        tbody.appendChild(row); // Adiciona a nova linha ao tbody
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}


function getSearchId(myOccurence) {

  console.log(myOccurence)
  if (myOccurence) {
    // Atualiza o título do modal
    const title = document.getElementById('exampleModalLabel');
    title.innerText = myOccurence.title;
  }

  if(!myOccurence.parecer) {
    myOccurence.parecer = "Sem parecer"
  }

  if (myOccurence.status == 1) {
    myOccurence.status = "em análise"
  } else if (myOccurence.status == 2) {
    myOccurence.status = "indeferida"
  } else if (myOccurence.status == 3) {
    myOccurence.status = "resolvida"
  }

  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = `
  <p><strong>Descrição:</strong> ${myOccurence.description}</p>
   <p><strong>Status:</strong> ${myOccurence.status}</p>
   <p><strong>Endereço:</strong> ${myOccurence.address}</p>
   <p><strong>Parecer:</strong> ${myOccurence.parecer}</p>
`;
}

function getId(id) {
  const myOccurence = JSON.parse(localStorage.getItem('ocorrencias')).find(ocorrencia => ocorrencia.id === id);

  if (myOccurence) {
    // Atualiza o título do modal
    const title = document.getElementById('exampleModalLabel');
    title.innerText = myOccurence.title;
  }

  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = `
  <p><strong>Descrição:</strong> ${myOccurence.description}</p>
    <p><strong>Endereço:</strong> ${myOccurence.address}</p>
  <p><strong>Status:</strong> 
    <select id="statusSelect">
      <option value="1" ${myOccurence.status === 1 ? 'selected' : ''}>Em Análise</option>
      <option value="2" ${myOccurence.status === 2 ? 'selected' : ''}>Indeferida</option>
      <option value="3" ${myOccurence.status === 3 ? 'selected' : ''}>Resolvida</option>
    </select>
  </p>
  <div class="form-group">
    <label for="parecerTextarea">Parecer:</label>
    <textarea id="parecerTextarea" class="form-control" rows="3"></textarea>
  </div>
`;

  // Evento para o botão de salvar
  const saveButton = modalBody.nextElementSibling.querySelector('.btn-primary');

  saveButton.onclick = function () {
    // Atualiza a ocorrência com os novos dados
    const newStatus = document.getElementById('statusSelect').value;
    const parecer = document.getElementById('parecerTextarea').value;

    const updatedOccurence = {
      ...myOccurence,
      status: parseInt(newStatus, 10),
      parecer: parecer // Armazenando o parecer
    };

    console.log('Ocorrência atualizada:', updatedOccurence);

    fetch('http://localhost:5000/occurences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOccurence), // Enviar o objeto diretamente
    })

    location.reload();

  };


}