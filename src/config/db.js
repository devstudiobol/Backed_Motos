const {Pool}=require("pg")
const fs=require("fs")
const pool=new Pool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME,
    ssl:false

})
pool.connect((err,client,release)=>{
    if(err){
        console.log("error de conexion",err.stack)
    }
    else{
        console.log("conexion exitoso")
        release()
    }
}) 
module.exports=pool