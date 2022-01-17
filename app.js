const express = require('express')
const {v4: uuidv4} = require('uuid');
const fs = require('fs')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

app.post('/note/add', (req, res) => {

    const existNotes = getNoteData()
    const noteData = req.body

    if (noteData.name == null || noteData.text == null || noteData.hash == null || !Array.isArray(noteData.hash)) {
        return res.status(401).send({error: true, msg: 'Note data missing'})
    }
    newNote = {...noteData, "id": uuidv4()}
    existNotes.push(newNote)
    saveNoteData(existNotes);
    res.send(newNote)
})

app.get('/note/list', (req, res) => {
    const notes = getNoteData()
    res.send(notes)
})

app.patch('/note/update/:id', cors(), (req, res) => {

    const id = req.params.id
    const noteData = req.body
    const updatedNote = {...noteData, id}
    const existNotes = getNoteData()
    const findExist = existNotes.find(note => note.id === id)

    if (!findExist) {
        return res.status(409).send({error: true, msg: 'name not exist'})
    }

    const updateNote = existNotes.filter(note => note.id !== id)
    updateNote.push({...noteData, id})
    saveNoteData(updateNote)
    res.send(updatedNote)
})

app.delete('/note/delete/:id', cors(), (req, res) => {

    const id = req.params.id
    const existNotes = getNoteData()
    const filterNote = existNotes.filter(note => note.id !== id)

    if (existNotes.length === filterNote.length) {
        return res.status(409).send({error: true, msg: 'name does not exist'})
    }

    saveNoteData(filterNote)
    res.send(id)
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