import 'server-only';
export const databaseConfig = {
    URI:process.env.MONGODB_URI
}

console.log("MONGODB_URI =", process.env.MONGODB_URI);