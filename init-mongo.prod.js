// Crear usuarios
db.createUser({
    user: "prd_sysmongodb",
    pwd: "c009c5b4a30b8f1feb344526044d34543c1534d430b31789b6b5e03d4b6be50c5c4a359c604ff02ac3652f79036ceaa3711ea6d51936afd2883063b7356dd870p",
    roles: [{ role: "readWrite", db: "prd_adquisiciones" }, { role: "readWriteAnyDatabase", db: "admin" },{ role: "root", db: "admin" }]
});



// Crear bases de datos
db.getSiblingDB('prd_adquisiciones');
