# AccessControlProject

<b> Developer Workflow <b>
- sudo docker compose build server-user server-data
- sudo docker compose up mysql-users mysql-data -d
- sudo docker compose up server-user server-data
- sudo docker compose down --volumes --remove-orphans 