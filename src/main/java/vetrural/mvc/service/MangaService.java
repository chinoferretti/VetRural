package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.EventoSanitario;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import vetrural.mvc.repository.EventoSanitarioRepository;
import java.util.List;
import java.util.Optional;

@Service
public class MangaService {

    @Autowired
    private BovinoService bovinoService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private TactoService tactoService;

    @Autowired
    private PesajeService pesajeService;

    @Autowired
    private BoqueoService boqueoService;

    @Autowired
    private VacunacionService vacunacionService;

    @Autowired
    private EventoSanitarioRepository eventoSanitarioRepository;

    public Tacto registrarTacto(String idBovino, Long registradoPorId, SituacionEnum situacion, PeriodoEnum periodo) {
        Bovino bovino = bovinoService.obtenerOFallar(idBovino);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return tactoService.registrarTacto(bovino, registradoPor, situacion, periodo);
    }

    public Pesaje registrarPesaje(String idBovino, Long registradoPorId, double peso) {
        Bovino bovino = bovinoService.obtenerOFallar(idBovino);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return pesajeService.registrarPesaje(bovino, registradoPor, peso);
    }

    public Boqueo registrarBoqueo(String idBovino, Long registradoPorId, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura) {
        Bovino bovino = bovinoService.obtenerOFallar(idBovino);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return boqueoService.registrarBoqueo(bovino, registradoPor, dientes, deterioro, dentadura);
    }

    public Vacunacion registrarVacunacion(String idBovino, Long registradoPorId, VacunaTipoEnum vacuna) {
        Bovino bovino = bovinoService.obtenerOFallar(idBovino);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return vacunacionService.registrarVacunacion(bovino, registradoPor, vacuna);
    }

    public Optional<Tacto> getUltimoTacto(String idBovino) {
        return tactoService.getUltimoTacto(bovinoService.obtenerOFallar(idBovino));
    }

    public Optional<Pesaje> getUltimoPesaje(String idBovino) {
        return pesajeService.getUltimoPesaje(bovinoService.obtenerOFallar(idBovino));
    }

    public Optional<Boqueo> getUltimoBoqueo(String idBovino) {
        return boqueoService.getUltimoBoqueo(bovinoService.obtenerOFallar(idBovino));
    }

    public List<Vacunacion> getVacunaciones(String idBovino) {
        return vacunacionService.getVacunacionesPorBovino(bovinoService.obtenerOFallar(idBovino));
    }

    public List<EventoSanitario> getCronologia(String idBovino) {
        return eventoSanitarioRepository.findByBovinoOrderByFechaHoraDesc(bovinoService.obtenerOFallar(idBovino));
    }

    private Usuario validarUsuarioHabilitado(Long idUsuario) {
        Usuario u = usuarioService.obtenerOFallar(idUsuario);
        if (!usuarioService.puedeRegistrarEventoSanitario(u)) {
            throw new IllegalArgumentException("El usuario " + idUsuario + " no está habilitado para registrar eventos sanitarios (debe ser Veterinario o Anotador)");
        }
        return u;
    }
}
