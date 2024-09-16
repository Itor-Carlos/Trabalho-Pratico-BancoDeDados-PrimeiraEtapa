const { Client } = require("pg");

const arrayPessoasInsert = [
    {
        documento: "10022473",
        telefones: ["74999250794", "79981396317"],
        primeiro_nome: "Arnaldo",
        sobrenome: "Cesar Coelho",
    },
    {
        documento: "82141322",
        telefones: ["79981396317"],
        primeiro_nome: "Beto",
        sobrenome: "Carreiro",
    },
    {
        documento: "28741411",
        telefones: ["74999250794"],
        primeiro_nome: "Capitão",
        sobrenome: "America",
    }
];

const conexaoPostgres = new Client({
    host: 'databaseufs.cxcqkp3h7gwq.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: "aluno",
    password: "alunoufs",
    database: "dbUFS",
    ssl: {
        rejectUnauthorized: false,
    }
});

async function realizaConexaoPostgres() {
    try {
        await conexaoPostgres.connect();

        await conexaoPostgres.query(`
            CREATE TABLE IF NOT EXISTS Pessoa (
                documento INT NOT NULL,
                telefones VARCHAR(45)[] NOT NULL,
                primeiro_nome VARCHAR(45) NOT NULL,
                sobrenome VARCHAR(45) NOT NULL,
                PRIMARY KEY (documento)
            );
        `);
    } catch (error) {
        console.log(`Erro ao realizar conexão com o banco PostgreSQL: ${error}`);
    }
}

async function fechaConexaoPostgres() {
    await conexaoPostgres.end();
    console.log("Conexão com o PostgreSQL encerrada\n");
}

async function inserirPessoasTransaction(array) {
    await conexaoPostgres.query('BEGIN');

    let sql_insert = 'INSERT INTO Pessoa (documento, telefones, primeiro_nome, sobrenome) VALUES ';
    let valoresPessoa = [];
    let contadorPessoa = 1;

    array.forEach((pessoa, index) => {
        const { documento, telefones, primeiro_nome, sobrenome } = pessoa;

        sql_insert += `($${contadorPessoa}, $${contadorPessoa+1}, $${contadorPessoa+2}, $${contadorPessoa+3})`;
        if (index < array.length - 1) {
            sql_insert += ', ';
        }

        valoresPessoa.push(documento, telefones, primeiro_nome, sobrenome);
        contadorPessoa += 4;
    });

    try {
        await conexaoPostgres.query(sql_insert, valoresPessoa);
        
        const sql_select = "SELECT * FROM Pessoa";

        await conexaoPostgres.query(sql_select);
        
        await conexaoPostgres.query('COMMIT');
    } catch (errorInsert) {
        await conexaoPostgres.query('ROLLBACK');
        console.log(`Erro ao realizar insert: ${errorInsert}`);
    }
}

async function insertPessoa({documento, telefones, primeiro_nome, sobrenome}){
    const sql_insert = 'INSERT INTO Pessoa (documento, telefones, primeiro_nome, sobrenome) VALUES ($1, $2, $3, $4);';
    try {
        await conexaoPostgres.query(sql_insert, [documento, telefones, primeiro_nome, sobrenome]);
        console.log(`Pessoa -> ${documento}-${telefones}-${primeiro_nome}-${sobrenome} criado com sucesso`);
    } catch (errorInsert) {
        console.log(`Erro ao realizar insert: ${errorInsert}`);
    }
}

async function getAllPessoas() {
    const sql_select = 'SELECT * FROM Pessoa;';
    const resultSelect = (await conexaoPostgres.query(sql_select)).rows;
    let contador = 1;
    resultSelect.forEach(pessoa => console.log(`pessoa n° ${contador++} | documento: ${pessoa.documento} | telefones: ${pessoa.telefones} | primeiro_nome: ${pessoa.primeiro_nome} | sobrenome: ${pessoa.sobrenome}\n`));
}

async function main() {
    await realizaConexaoPostgres();

    await insertPessoa({
        documento: "0876553",
        telefones: "{74999250794}",
        primeiro_nome: "itor",
        sobrenome: "carlos"
    });

    await inserirPessoasTransaction(arrayPessoasInsert);

    await getAllPessoas();
}

main();
