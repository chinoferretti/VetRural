package vetrural.mvc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.RegistrarBoqueoRequest;
import vetrural.mvc.dto.RegistrarPesajeRequest;
import vetrural.mvc.dto.RegistrarTactoRequest;
import vetrural.mvc.dto.RegistrarVacunacionRequest;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.service.MangaService;

@RestController
@RequestMapping("/api/manga")
public class MangaController {

    @Autowired
    private MangaService mangaService;

    @PostMapping("/tacto")
    public ResponseEntity<SituacionEnum> registrarTacto(@RequestBody RegistrarTactoRequest req) { // Registra un nuevo tacto para un bovino y devuelve la situación registrada
        SituacionEnum situacion = mangaService.registrarTacto(req.getIdBovino(), req.getSituacion(), req.getPeriodo());
        return ResponseEntity.ok(situacion);
    }

    @PostMapping("/pesaje")
    public ResponseEntity<Float> registrarPesaje(@RequestBody RegistrarPesajeRequest req) { // Registra un nuevo pesaje para un bovino y devuelve el peso registrado
        float peso = mangaService.registrarPesaje(req.getIdBovino(), req.getPeso());
        return ResponseEntity.ok(peso);
    }

    @PostMapping("/boqueo")
    public ResponseEntity<Void> registrarBoqueo(@RequestBody RegistrarBoqueoRequest req) { // Registra un nuevo boqueo para un bovino
        mangaService.registrarBoqueo(
                req.getIdBovino(), req.getDientes(), req.getDeterioro(), req.getDentadura());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/vacunacion")
    public ResponseEntity<Void> registrarVacunacion(@RequestBody RegistrarVacunacionRequest req) { // Registra una nueva vacunación para un bovino con las fechas de cada vacuna
        mangaService.registrarVacunacion(
                req.getIdBovino(), req.getAftosa(), req.getBrucelosis(),
                req.getCarbunco(), req.getClostridial(), req.getIbrBvd());
        return ResponseEntity.ok().build();
    }
}
