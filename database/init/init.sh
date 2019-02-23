cd /init/

pwd

# tar -xzf backup.archive

# mongorestore -d bd2 /init/backup/bd2/

# rm -rf /init/backup/

mongo bd2 --eval "db.createUser({
     user: 'padawan',
     pwd: '123Parola',
     roles:
       [
         { role: 'readWrite', db: 'bd2' }
       ]
   })"