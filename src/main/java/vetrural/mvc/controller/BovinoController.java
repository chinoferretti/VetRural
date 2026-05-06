package vetrural.mvc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.CrearBovinoRequest;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.service.BovinoService;
import java.util.List;

@RestController
@RequestMapping("/api/bovinos")
public class BovinoController {

    @Autowired
    private BovinoService bovinoService;

    @GetMapping
    public List<Bovino> listar() { // Obtiene la lista de todos los bovinos registrados en SQL
        return bovinoService.listarBovinos();
    }

    @GetMapping("/{id}") 
    public ResponseEntity<Bovino> getBovino(@PathVariable String id) { // Obtiene un bovino por su ID
        return bovinoService.getBovino(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Bovino> crear(@RequestBody CrearBovinoRequest req) { // Crea un nuevo bovino a partir de los datos recibidos en el request body y lo guarda en SQL
        Bovino bovino = bovinoService.crearBovino(req.getId(), req.getNacimiento(), req.getSexo(), req.getObs(), req.getRaza(), req.getTipo());
        return ResponseEntity.ok(bovino);
    }

    @PostMapping
    public ResponseEntity<Bovino> crearRapido(@RequestParam String id, @RequestParam String sexo) { // Crea un nuevo bovino con solo ID y sexo, dejando el resto de los campos nulos, y lo guarda en SQL
        Bovino bovino = bovinoService.crearBovinoRapido(id, SexoEnum.valueOf(sexo.toUpperCase()));
        return ResponseEntity.ok(bovino);
    }

    @PutMapping("/{id}/observaciones")
    public ResponseEntity<Bovino> actualizarObs(@PathVariable String id, @RequestParam String obs) { // Actualiza las observaciones de un bovino existente por su ID
        return ResponseEntity.ok(bovinoService.actualizarObservaciones(id, obs));
    }

    @GetMapping("/lotes")
    public List<String> getLotes() { // Obtiene la lista de todos los lotes registrados en SQL
        return bovinoService.getLotes();
    }

    @GetMapping("/lotes/{lote}")
    public List<Bovino> getBovinosPorLote(@PathVariable String lote) { // Obtiene la lista de bovinos de un lote específico por su nombre de lote
        return bovinoService.listarBovinosPorLote(lote);
    }

    @PostMapping("/lotes")
    public ResponseEntity<Void> crearLote(@RequestParam String nombre, @RequestBody List<String> idBovinos) { // Crea un nuevo lote con un nombre y añade una lista de IDs de bovinos
        bovinoService.crearLote(nombre, idBovinos);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lotes")
    public ResponseEntity<Void> eliminarLote(@RequestParam String nombre) { // Elimina un lote por su nombre, desvinculando los bovinos que pertenecían a ese lote
        bovinoService.eliminarLote(nombre);
        return ResponseEntity.ok().build();
    }

     @PutMapping("/{id}/lote")
    public ResponseEntity<Void> asignarLote(@PathVariable String id, @RequestParam String lote) { // Asigna un bovino a un lote existente por su ID y el nombre del lote
        bovinoService.anadirBovinoALote(id, lote);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/existe") 
    public boolean existeBovino(@PathVariable String id) { // Verifica si un bovino existe por su ID, devolviendo true o false
        return bovinoService.existeBovino(id);
    }
}
