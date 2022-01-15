const express = require('express')
const {v4: uuidv4} = require('uuid');
const fs = require('fs')
const app = express()
const cors = require('cors')

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.post('/note/add', cors(corsOptions), (req, res) => {

    const existNotes = getNoteData()
    const noteData = req.body

    if (noteData.name == null || noteData.text == null || noteData.hash == null || !Array.isArray(noteData.hash)) {
        return res.status(401).send({error: true, msg: 'Note data missing'})
    }
    existNotes.push({...noteData, "id": uuidv4()})
    saveNoteData(existNotes);
    res.send({success: true, msg: 'Note data added successfully'})
})

app.get('/note/list', (req, res) => {
    const notes = getNoteData()
    res.send(notes)
})

app.patch('/note/update/:id', cors(corsOptions), (req, res) => {

    const id = req.params.id
    const noteData = req.body
    const existNotes = getNoteData()
    const findExist = existNotes.find(note => note.id === id)

    if (!findExist) {
        return res.status(409).send({error: true, msg: 'name not exist'})
    }

    const updateNote = existNotes.filter(note => note.id !== id)
    updateNote.push(noteData)
    saveNoteData(updateNote)

    res.send({success: true, msg: 'Note data updated successfully'})
})

app.delete('/note/delete/:id', cors(corsOptions), (req, res) => {

    const id = req.params.id
    const existNotes = getNoteData()
    const filterNote = existNotes.filter(note => note.id !== id)

    if (existNotes.length === filterNote.length) {
        return res.status(409).send({error: true, msg: 'name does not exist'})
    }

    saveNoteData(filterNote)
    res.send({success: true, msg: 'Note removed successfully'})
})

const saveNoteData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('data.json', stringifyData)
}

const getNoteData = () => {
    const jsonData = fs.readFileSync('data.json')
    return JSON.parse(jsonData)
}

if (!module.parent) {
    const port = process.env.PORT || 3001;

    app.listen(port, () => {
        console.log("Express server listening on port " + port + ".");
    });
}