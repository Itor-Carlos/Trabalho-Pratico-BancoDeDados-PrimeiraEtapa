const { Client } = require("pg");

const arrayPessoasInsert = [
    {
        documento: "1002247913123",
        telefones: ["74999250794", "79981396317"],
        primeiro_nome: "Arnaldo",
        sobrenome: "Cesar Coelho",
    },
    {
        documento: "82141320",
        telefones: ["79981396317"],
        primeiro_nome: "Beto",
        sobrenome: "Carreiro",
    },
    {
        documento: "28741450",
        telefones: ["74999250794"],
        primeiro_nome: "Capitão",
        sobrenome: "America",
    }
];

const conexaoPostgres = new Client({
    host: 'localhost',
    port: 5432,
    user: "root",
    password: "root",
    database: "projeto_logico"
});

async function realizaConexaoPostgres() {
    try {
        await conexaoPostgres.connect();

        await conexaoPostgres.query(`
            CREATE TABLE IF NOT EXISTS Pessoa (
                documento VARCHAR(50) PRIMARY KEY,
                telefones TEXT[],
                primeiro_nome VARCHAR(100),
                sobrenome VARCHAR(100)
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

async function inserirPessoa(array) {
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
        
        await conexaoPostgres.query('COMMIT');
        array.forEach(pessoa => console.log(`Pessoa -> ${pessoa.documento}-${pessoa.telefones}-${pessoa.primeiro_nome}-${pessoa.sobrenome} criado com sucesso`));
    } catch (errorInsert) {
        await conexaoPostgres.query('ROLLBACK');
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

    inserirPessoa(arrayPessoasInsert);

    await getAllPessoas();
}

main();
