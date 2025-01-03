// Crear usuarios
db.createUser({
    user: "dev_sysmongodb",
    pwd: "c009c5b4a30b8f1feb344526044d34543c1534d430b31789b6b5e03d4b6be50c5c4a359c604ff02ac3652f79036ceaa3711ea6d51936afd2883063b7356dd870d",
    roles: [{ role: "dbAdmin", db: "dev_adquisiciones" }]
});



// Crear bases de datos
db.getSiblingDB('dev_adquisiciones');
