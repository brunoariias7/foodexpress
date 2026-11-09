FOOD EXPRESS 
Descripción del proyecto

FoodExpress es una aplicación web de pedidos de comida desarrollada como proyecto académico. Permite a los usuarios registrarse, iniciar sesión, explorar un menú de productos, agregar productos al carrito y realizar pedidos.

Tecnologías utilizadas

HTML5: estructura de las páginas.
CSS3: diseño y estilos visuales.
JavaScript: funcionalidades e interactividad.
Node.js: entorno de ejecución del backend.
Express.js: creación del servidor y gestión de rutas.
MySQL: almacenamiento de datos.
bcrypt: protección de contraseñas mediante hash.
express-session: gestión de sesiones de usuario.
mysql2: conexión entre Node.js y MySQL.
dotenv: gestión de variables de entorno.
cors: configuración de solicitudes entre frontend y backend.

Herramientas necesarias

Para ejecutar el proyecto en un entorno local se necesita:

 Node.js y npm.
 XAMPP.
 MySQL.
 Visual Studio Code (recomendado).
 Un navegador web.

Instalación y configuración

1. Obtener el proyecto

Descargar o clonar el repositorio de GitHub:

git clone https://github.com/brunoariias7/foodexpress.git

Ingresar a la carpeta del proyecto:

cd foodexpress

2. Instalar dependencias

Abrir una terminal en la carpeta principal y ejecutar:

npm install

3. Configurar la base de datos

1. Abrir XAMPP.
2. Iniciar Apache y MySQL.
3. Ingresar a phpMyAdmin desde el navegador.
4. Crear una base de datos llamada foodexpress o seleccionar la existente.
5. Importar el archivo foodexpress.sql desde la pestaña Importar.

4. Configurar las variables de entorno

Crear un archivo .env en la carpeta principal del proyecto y configurar las variables necesarias para la conexión con MySQL y las sesiones.

Los valores deben coincidir con la configuración del entorno local.

Importante: no compartir públicamente las contraseñas ni los secretos utilizados en este archivo.

5. Ejecutar el servidor

Desde la terminal, en la carpeta principal del proyecto, ejecutar:

npm start

El servidor Node.js iniciará utilizando el archivo server.js.

6. Acceder al sistema

Una vez iniciado el servidor, abrir el proyecto desde el entorno local utilizando Live Server en Visual Studio Code.

El backend y la base de datos deben permanecer activos para utilizar las funcionalidades dinámicas.

Funcionalidades principales

* Registro de nuevos usuarios.
* Inicio y cierre de sesión.
* Gestión de sesiones.
* Visualización de productos desde la base de datos.
* Carrito de compras.
* Cálculo de subtotales y total.
* Confirmación de pedidos.
* Almacenamiento de pedidos en MySQL.
* Navegación entre las diferentes secciones del sitio.

Estructura general

El proyecto está organizado en archivos HTML, hojas de estilo CSS, scripts JavaScript, recursos gráficos, configuración del backend y archivos de conexión con la base de datos.

Autor

Proyecto académico desarrollado por Bruno Arias, Andres Albornoz, Sofia Barbaday.

FoodExpress — Sistema web de pedidos de comida.