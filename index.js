const express= require('express')
const app= express();
app.use(express.json())
app.use(express.static("."));
app.listen(8080)
// yarn add prisma @prisma/client
// yarn prisma init 
// .env chứa biến môi có chuỗi để kết nối CSDL
// schema.prisma => model : chứa các đối tượng (DAO) tương ứng với table trong CSDL

// yarn prisma db pull
// yarn prisma generate

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // tương tự initModel của sequelize

app.get("/get-user", async (req, res) => {

    // SELECT * FROM user
        // prisma.$queryRaw("SELECT * FROM user"); // sử dụng được lệnh sql đối với trường hợp  đặc biệt

    // model.user.findAll()
    // liên kết relationship (join)
    let data = await prisma.user.findMany({
        include: {
            like_res: {
                include: {
                    restaurant: true
                }
            }
        },

        // where: {
        //     full_name: {
        //         contains: ""   // WHERE full_name LIKE '%a%'
        //     }
        // }
    }); // list object

    res.send(data);
})

app.post("/create-user", async (req, res) => {

    let { full_name, email, pass_word } = req.body;
    let data = {
        full_name, email, pass_word
    }

    await prisma.user.create({ data });

    let { user_id } = req.params;
    await prisma.user.update({ data: data, where: { user_id } });

    await prisma.user.delete({ where: { user_id } })
})




const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`

    type User { 
        user_id: ID
        full_name: String
        email: String
        like_res:[Like_Res]
    }
    type Like_Res{
        user_id: Int
        res_id: Int
        date_like: String 
    }

    type Product {
        productId: ID
        productName: String
    }

    type RootQuery{
        getUser: [User]
    }

    type RootMutation{
        createUser(id: Int, name: String): Product
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);

const rootValue = {
    getUser: async () => {
        let data = await prisma.user.findMany(
            {
                include:{
                    like_res:{
                        include:{
                            restaurant:true
                        }
                    }
                }
            }
        );

        // list object
        return data;
    },

    createUser: ({ id, name }) => {

        return {
            productId: id,
            productName: name
        };
    }

};

app.use("/api", graphqlHTTP({
    schema,   // nơi chứa model của graphql
    rootValue, // nơi truyền data cho các model ở schema
    graphiql: true
}));

// API get-user(getName) => tất cả thuộc của User
// name, email => API get-user-info 
// id , name => 
// cách fe gọi query lấy dữ liệu từ BE grapql
// const graphqlQuery = {
//     "operationName": "fetchUser",
//     "query": `query fetchUser { getUser { user_id, full_name,email } }`,
//     "variables": {}
// };

// const response = axios({
//     url: endpoint,
//     method: 'post',
//     headers: headers,
//     data: graphqlQuery
// });
