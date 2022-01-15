const express = require('express')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const app = express()

const PORT = process.env.PORT || 3000

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(allowCrossDomain);
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.use(express.json())

app.post('/note/add', (req, res) => {

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

app.patch('/note/update/:id', (req, res) => {

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

app.delete('/note/delete/:id', (req, res) => {

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

app.listen(PORT, () => {
    console.log('Server runs on port 3000')
})