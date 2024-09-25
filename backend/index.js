import express from 'express'
import cors from 'cors'
import fs from 'fs';


const app = express()


app.use(cors());
app.use(express.json());

app.get('/occurences', (req, res) => {
    const filePath = './db/occurences.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const occurences = fileData ? JSON.parse(fileData) : [];
    return res.json(occurences);
})

app.post('/occurences', (req, res) => {
    const filePath = './db/occurences.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const occurences = fileData ? JSON.parse(fileData) : [];

    const { id } = req.body;

    const index = occurences.findIndex(ocorrencia => ocorrencia.id === id);

    if (index !== -1) {
        const { coordenadas } = occurences[index];

        occurences[index] = {
            ...occurences[index],
            ...req.body,
            coordenadas
        };
    } else {
        let newId
        do {
            newId = Math.floor(Math.random() * 1000000);
        } while (occurences.some(occurences => occurences.id === id));
        const newOccurence = {
            id: newId,
            ...req.body,
            coordenadas: req.body.coordenadas
        };
        occurences.push(newOccurence);
        res.status(200).send(JSON.stringify(newOccurence));

    }

    fs.writeFileSync(filePath, JSON.stringify(occurences, null, 2));
});


app.get('/users', (req, res) => {

    const filePath = './db/users.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const users = fileData ? JSON.parse(fileData) : [];
    res.json(users);  // Aqui eu já envio o array de objetos
})

app.post('/users', (req, res) => {

    const filePath = './db/users.json';
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const users = fileData ? JSON.parse(fileData) : [];
    let id;
    do {
        id = Math.floor(Math.random() * 1000000);
    } while (users.some(user => user.id === id));
    const newUser = { id: id, ...req.body };

    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    res.status(201).send(req.body);

})


app.listen(5000, () => {
    console.log('Aplicação Online!')
})