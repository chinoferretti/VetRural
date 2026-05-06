package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import java.time.LocalDate;

@Service
public class MangaService {

    @Autowired
    private BovinoService bovinoService; 

    @Autowired
    private TactoService tactoService;

    @Autowired
    private PesajeService pesajeService;

    @Autowired
    private BoqueoService boqueoService;

    @Autowired
    private VacunacionService vacunacionService;

    public SituacionEnum registrarTacto(String idBovino, SituacionEnum situacion, PeriodoEnum periodo) { // Registra un nuevo tacto para un bovino y devuelve la situación registrada
        validarBovino(idBovino);
        return tactoService.registrarTacto(idBovino, situacion, periodo).getSituacion();
    }

    public float registrarPesaje(String idBovino, float peso) { // Registra un nuevo pesaje para un bovino y devuelve el peso registrado
        validarBovino(idBovino);
        return pesajeService.registrarPesaje(idBovino, peso).getPeso();
    }

    public void registrarBoqueo(String idBovino, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura) { // Registra un nuevo boqueo para un bovino 
        validarBovino(idBovino);
        boqueoService.registrarBoqueo(idBovino, dientes, deterioro, dentadura);
    }

    public void registrarVacunacion(String idBovino, LocalDate aftosa, LocalDate brucelosis, LocalDate carbunco, LocalDate clostridial, LocalDate ibrBvd) { // Registra una nueva vacunación para un bovino con las fechas de cada vacuna
        validarBovino(idBovino);
        vacunacionService.registrarVacunacion(idBovino, aftosa, brucelosis, carbunco, clostridial, ibrBvd);
    }

    private void validarBovino(String idBovino) { // Valida que el bovino exista 
        if (!bovinoService.existeBovino(idBovino)) {
            throw new IllegalArgumentException("Bovino no encontrado: " + idBovino);
        }
    }
}
