import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const PORT = 8000;
const IP = 'localhost';

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({  
  host: `${IP}`,
  user: 'root',
  password: 'Adi@030604',
  database: 'Destify',
  waitForConnections: true, 
});


app.get('/getPassword',(req,res)=>{
  const userID = req.query.userID;
  if(!userID){
    return res.status(400).json({message:'userID is required'})
  }
  connection.execute(
    'SELECT pass AS Password FROM users WHERE userId=?',
    [userID],
    (err,results)=>{
      if(err){
        console.error(err);
        return res.status(500).send('Database query failed');
      }
      if(results.length>0){
        res.json({
          password : results[0].Password,
        });
      }
      else{
        res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

app.get('/getUserId',(req,res)=>{
  const userName = req.query.userName;
  if(!userName){
    return res.status(400).json({message:'userName is required'})
  }
  connection.execute(
    'SELECT userId AS userID FROM users WHERE userName=?',
    [userName],
    (err,results)=>{
      if(err){
        console.error(err);
        return res.status(500).send('Database query failed');
      }
      if(results.length>0){
        res.json({
          userID : results[0].userID,
        });
      }
      else{
        res.status(404).json({ message: 'User not found' });
      }
    }
  )
})



app.get('/getLocation', (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  connection.execute(
    'SELECT dest_lat AS latitude, dest_long AS longitude,dest_name AS destination FROM sessions WHERE sessionId = (SELECT sessionId from session_users WHERE userId=?)',
    [userID],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query failed');
      }

      if (results.length > 0) {
        res.json({
          userId:userID,
          destination:results[0].destination,
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

app.get('/getUserLocation', (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  connection.execute(
    'SELECT Lat AS latitude, Lon AS longitude, userName AS Name FROM users WHERE userId=?',
    [userID],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query failed');
      }

      if (results.length > 0) {
        res.json({
          userId:userID,
          userName:results[0].Name,
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

app.get('/getUsers', (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  connection.execute(
    'SELECT userId FROM session_users WHERE sessionId = (SELECT sessionId FROM session_users WHERE userId = ?)AND userId <> ?;',
    [userID,userID],
    (err, users) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query failed');
      }

      if (users.length > 0) {
        res.json({
            users
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

app.post('/putLocation',(req,res)=>{
  const {userID,latitude,longitude} = req.body;
  if(!userID||latitude==undefined||longitude==undefined){
    return res.status(400).json('userId,latitude and longitude are required');
  }
  connection.execute(
    'UPDATE users SET Lat=?, Lon=? WHERE userId=?',[latitude,longitude,userID],
    (err,results)=>{
      if(err){
        console.error(err);
        res.status(500).json('Database query failed!');
      }
      if(results.affectedRows>0){
        res.json({message:'Loaction updated successfully!'});
      }
      else{
        res.status(404).json({message:'User not found!'});
      }
    }
  );
});


app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running at http://${IP}:${PORT}`);
});
