const { error } = require('console');
const express = require ('express');
const mysql = require ('MySQL');
const app = express();
const util = require ('util');
const port = 3000;

app.use(express.json());

//Conexion con la DB
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'bibliotecas',
});
conexion.connect((error)=>{
    if(error){
        throw error;
    }
    console.log('Conexion con base de datos establecida');
})

const qy = util.promisify(conexion.query).bind(conexion);//Permite el uso de async/await

//Logica de negocio

//Categoria

app.post('/categoria', async (req, res) =>{
    try{
        let nombre = req.body.nombre;
        if(!nombre){
            throw new Error('La categoria no fue enviada');
        }
        
        nombre = nombre.toUpperCase();
        let query = 'SELECT id FROM categoria WHERE nombre = ?';
        let respuesta = await qy (query, [nombre]);

        if(respuesta.length > 0){
            throw new Error('La categoria ya existe');
        }
        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        respuesta = await qy (query, [nombre]);
        console.log(respuesta);
        res.send({'respuesta': respuesta});

    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
 })


app.get('/categoria', async (req,res)=>{
    try{
        const query = 'SELECT * FROM  categoria';
        const respuesta = await qy(query);
        res.send({'respuesta': respuesta});
    
    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }

});

 app.get('/categoria/:id', async (req, res)=>{
    try{
        const query = 'SELECT * FROM  categoria WHERE id = ?';
        const respuesta = await qy(query, [req.params.id]);
        if(respuesta.length == 0){
            throw Error('Categoiria no encontrada');
        }

        res.send({'respuesta': respuesta});
    
    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }

 }); 
  
/*
 app.put('/categoria/:id', async (req, res)=>{
     try{
        const nombre = req.body.nombre;

        if(!nombre){
            throw new Error('La categoria no fue enviada');
        }
// Verifico si ya existe la categoria con este nombre
        let query = 'SELECT * FROM categoria WHERE nombre = ? AND id <> ?';
        let respuesta = await qy(query, [nombre, req.params.id]);

        if (respuesta.length > 0){
            throw new Error('El nombre de la ctegoria ya existe');
        }

        query = 'UPDATE categoria SET nombre = ? WHERE id = ?';
        respuesta = await qy (query, [nombre, req.params.id]);
        res.send({"respuesta": respuesta});
        

     }
     catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
 })
*/
 app.delete('/categoria/:id', async (req, res)=>{
     try{
        let query = 'SELECT id FROM categoria WHERE id= ?';
        let respuesta = await qy (query, [req.params.id]);
        if(respuesta.length == 0){
            throw new Error('La categoria que intenta eiminar no existe');
        }
         query = 'SELECT * FROM libro WHERE categoria_id = ?';
         respuesta = await qy( query, [req.params.id]);
         if(respuesta.length > 0){
             throw new Error('La categoria esta asigada a un libro, no se puede eliminar');
         }
         
         query = 'DELETE FROM categoria WHERE id = ?';
         respuesta = await qy(query, [req.params.id]);
         res.send({"respuesta": respuesta});
         
     }
     catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
 })
 //Persona

 app.post('/persona', async (req, res)=>{
    try{
        if(!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.mail ){
            throw new Error('Todos los datos son obligatorios');
        }
        let email = req.body.mail;
        email = email.toUpperCase();
        let query = 'SELECT id FROM persona WHERE mail = ?';
        let respuesta = await qy (query, [email]);

        if(respuesta.length > 0){
            throw new Error('El email ya se encunetra registrado');
        }


        query = 'INSERT INTO persona (nombre, apellido, alias, mail) VALUES (?,?,?,?)';
        let datos = [req.body.nombre, req.body.apellido, req.body.alias, req.body.mail];
        for(let i = 0; i < datos.length; i++){
            datos[i] = datos[i].toUpperCase();
        };
        
        respuesta = await qy (query, datos);
        console.log(respuesta);
        res.send({'respuesta': respuesta});

    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }

})

app.get('/persona', async (req, res)=>{
    try{
        let query = 'SELECT * FROM persona';
        let respuesta = await qy (query);
        res.send({"respuesta": respuesta});

    }
    catch(e){
        console.error(e.message);
    
        res.status(413).send({"Error": e.message});
    }

})

app.get('/persona/:id', async (req, res)=>{
    try{
       let query = 'SELECT * FROM persona WHERE id = ?';
       let respuesta = await qy (query, [req.params.id]);
       
       if(respuesta.length == 0){
           throw new Error('El usuario no existe');
       }
       res.send({"respuesta": respuesta});

    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }

})

app.put('/persona/:id', async (req, res) => {
        try{
            let query = 'SELECT *FROM persona WHERE id = ?';
            let respuesta = await qy(query,[req.params.id]);
            if (respuesta.length ==0){
             throw new Error  ("El usuario no exixste");
            };
    query = 'UPDATE persona SET nombre =?, apellido =?, alias =?  WHERE id=?';
    let datos = [req.body.nombre, req.body.apellido, req.body.alias, req.params.id];
        for(let i = 0; i < datos.length; i++){
            datos[i] = datos[i].toUpperCase();
        };
    respuesta = await qy(query, datos);
    res.send({"respuesta": respuesta});
    
    }

    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
})

//Libro
app.post('/libro', async (req, res) =>{
    try{
        if(!req.body.nombre || !req.body.categoria_id){
            throw new Error('Nombre y categoria son obligatorios');
        };

        const qyCategoria = 'SELECT id FROM categoria WHERE id = ?';
        let respuesta = await qy(qyCategoria, [req.body.categoria_id]);
        if(respuesta.length == 0){
            throw new Error('No existe la categoria');
        };
        /*
        const qyPersona = 'SELECT id FROM persona WHERE id = ?';
        respuesta = await qy(qyPersona,[req.body.persona_id]);
        if (respuesta.length ==0){
            throw new Error  ("El usuario no exixste");
        };
        */
        const qyLibro = 'SELECT nombre FROM libro WHERE nombre = ?';
        respuesta = await qy(qyLibro, [req.body.nombre]);

        if(respuesta.length > 0){
            throw new Error('El libro ya existe');
        };

        let query = 'INSERT INTO libro (nombre, descripcion, categoria_id) VALUES (?,?,?)';
        let datos = [req.body.nombre, req.body.descripcion, req.body.categoria_id];
        for(let i = 0; i < datos.length; i++){
            datos[i] = datos[i].toUpperCase();
        };
        
        respuesta = await qy (query, datos);
        console.log(respuesta);
        res.send({'respuesta': respuesta});

    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
})

app.get('/libro', async (req, res)=>{
    try{
        let query = 'SELECT * FROM libro';
        let respuesta = await qy (query);
        res.send({"respuesta": respuesta});

    }
    catch(e){
        console.error(e.message);
    
        res.status(413).send({"Error": e.message});
    }   

})

app.get('/libro/:id', async (req, res)=>{
    try{
       let query = 'SELECT * FROM libro WHERE id = ?';
       let respuesta = await qy (query, [req.params.id]);
       
       if(respuesta.length == 0){
           throw new Error('El libro no existe');
       }
       res.send({"respuesta": respuesta});

    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
});

app.put('/libro/:id', async( req, res)=>{
    try{
        let query = "SELECT id FROM libro WHERE id = ?";
        let respuesta = await qy( query, [req.params.id]);

        if( respuesta.length == 0){
            throw new Error('El libro no se encontró');
        }

        query = 'UPDATE libro SET descripcion = ? WHERE  id = ?';
        let datos = [req.body.descripcion, req.params.id];
        for(let i = 0; i < datos.length; i++){
            datos[i] = datos[i].toUpperCase();
        };
        respuesta = await qy(query, datos);
        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
})

app.put('/libro/prestar/:id', async( req, res)=>{
    try{
        let query = "SELECT id FROM libro WHERE id = ?";
        let respuesta = await qy( query, [req.params.id]);

        if( respuesta.length == 0){
            throw new Error('El libro no se encontró');
        }

        query = 'SELECT id FROM persona WHERE persona_id = ?';
        respuesta = await qy( query,[req.body.id]);

        if(respuesta.length == 0){
            throw new Error('La persona no existe');
        }

        query = 'SELECT persona_id FROM libro WHERE persona_id =?';
        respuesta = await qy(query, [req.body.persona_id]);
        
        if(respuesta.length > 0){
            throw new Error('El libro ya fue alquilado');
        }

        query = 'UPDATE libro SET persona_id = ? WHERE id = ?';
        let datos = [req.body.persona_id, req.params.id];
        for(let i = 0; i < datos.length; i++){
            datos[i] = datos[i].toUpperCase();
        };
        respuesta = await qy(query, datos);
        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
})
// Srvidor
app.listen(port, ()=>{
    console.log('Servidor escuchando en el puerto', port);
})