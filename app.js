const {Client} = require("pg");

console.log("passou");

const conexaoPostgres = new Client({
    host: 'localhost',
    port: 5432,
    user: "root",
    password: "root",
    database: "projeto_logico"
})

async function realizaConexaoPostgres(){
    try{
        await conexaoPostgres.connect();
        console.log("conectou");
    }
    catch(error){
        console.log(error);
    }
}

async function fechaConexaoPostgres(){
    await conexaoPostgres.end();
    console.log("Conexão com o PostgreSQL encerrada");
}

async function inserirPessoa({documento, telefones, primeiro_nome, sobrenome}){
    const sql_insert = 'INSERT INTO Pessoa (documento, telefones, primeiro_nome, sobrenome) VALUES ($1,$2,$3,$4)';
    try{
        await conexaoPostgres.query(sql_insert, [documento, telefones, primeiro_nome, sobrenome]);
        console.log(`Pessoa ${documento, telefones, primeiro_nome, sobrenome} criado com sucesso`);
    }
    catch(errorInsert){
        console.log(`Error ao realizar insert: ${errorInsert}`);
    }
}

async function getAllPessoas(){
    const sql_select = 'SELECT * FROM Pessoa;';
    const resultSelect = (await conexaoPostgres.query(sql_select)).rows;
    let contador = 1;
    resultSelect.forEach(pessoa => console.log(`pessoa n° ${contador++} | documento: ${pessoa.documento} | telefones: ${pessoa.telefones} | primeiro_nome: ${pessoa.primeiro_nome} | sobrenome: ${pessoa.sobrenome}\n`));
}

realizaConexaoPostgres();
inserirPessoa({
    documento: "12345678",
    telefones: [123,132],
    primeiro_nome: "itor",
    sobrenome: "carlos"
});
getAllPessoas();