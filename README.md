Este es el Proyecto para la materia de desarrollo de sistemas de 6to año
**Integrantes: Diego Bonahora - Franco Maguicha - Axel Ortiz - Dylan Gonzalez**
Sistema Móvil de Gestión y Trazabilidad de Tablets Corporativas
 
 Propósito del Proyecto
es una aplicación móvil diseñada para modernizar y digitalizar el control de inventario, 
préstamo y devolución de tablets corporativas dentro de un entorno empresarial. 
El sistema evoluciona el control tradicional de inventario estático hacia una **gestión dinámica en tiempo real**, reemplazando
las planillas manuales por la identificación física instantánea mediante el escaneo de etiquetas **QR** adheridas a cada dispositivo.
De esta manera, el encargado del pañol puede conocer en todo momento qué equipo está disponible, quién lo tiene asignado, bajo qué modalidad y
en qué condiciones físicas se encuentra.

 Funcionalidades Principales

* **Identificación Física por QR:** Lectura directa desde la cámara del dispositivo móvil para decodificar al instante la ficha técnica completa de cada tablet
 (Número de Serie, Procesador, Memoria RAM/Almacenamiento, Tamaño de Pantalla, Puertos y Conectividad).
* **Alta de Inventario y Etiquetado:** Registro de nuevos equipos en el pañol con generación automática de su código QR identificador.
* **Control de Préstamos y Despachos:** Vinculación directa de cada equipo retirado con el legajo del empleado responsable.
* **Validación de Seguridad para Home Office:** Bloqueo preventivo con alertas visuales si se intenta autorizar el retiro de un dispositivo fuera de la empresa
  sin una tarea operativa asignada que lo justifique.
* **Recepción y Auditoría Física:** Gestión de devoluciones con verificación del estado del hardware para decidir su
   reingreso al stock disponible o su derivación inmediata a reparación.

Ciclo de Vida y Estados del Dispositivo

A diferencia de los activos fijos, las tablets circulan constantemente con el personal. El sistema garantiza la integridad del inventario controlando cada unidad a 
través de cuatro estados exclusivos:

1. **En Pañol:** Equipo verificado y disponible en depósito para ser retirado.
2. **En Uso Local (Oficina):** Dispositivo asignado a un empleado para trabajar dentro de las instalaciones, con devolución obligatoria al finalizar la jornada.
3. **En Uso Externo (Home Office):** Dispositivo autorizado para traslado fuera de la empresa, vinculado estrictamente a un legajo y a una tarea asignada.
4. **En Servicio Técnico:** Equipo retirado de circulación por rotura, falla de hardware o actualización de sistema.

 Flujos Operativos (Casos de Uso)

* **CU-01 — Alta de Tablet en Pañol:** Incorporación de un nuevo dispositivo al inventario inicial y generación de su etiqueta lógica.
* **CU-02 — Despacho de Tablet:** Escaneo del equipo, validación de disponibilidad, asignación a legajo y control de modalidad (Oficina vs. Home Office).
* **CU-03 — Devolución de Dispositivo:** Escaneo de retorno, inspección física del equipo y actualización de estado hacia *En Pañol* o *En Servicio Técnico*.
