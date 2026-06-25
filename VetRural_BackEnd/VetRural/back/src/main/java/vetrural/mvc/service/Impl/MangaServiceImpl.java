package vetrural.mvc.service.Impl;

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
import vetrural.mvc.service.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MangaServiceImpl implements MangaService {

    @Autowired private BovinoService bovinoService;
    @Autowired private UsuarioService usuarioService;
    @Autowired private TactoService tactoService;
    @Autowired private PesajeService pesajeService;
    @Autowired private BoqueoService boqueoService;
    @Autowired private VacunacionService vacunacionService;
    @Autowired private EventoSanitarioRepository eventoSanitarioRepository;

    @Override
    public Tacto registrarTacto(Long bovinoId, Long registradoPorId, SituacionEnum situacion, PeriodoEnum periodo) {
        Bovino bovino = bovinoService.obtenerOFallar(bovinoId);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return tactoService.registrarTacto(bovino, registradoPor, situacion, periodo);
    }

    @Override
    public Pesaje registrarPesaje(Long bovinoId, Long registradoPorId, double peso) {
        Bovino bovino = bovinoService.obtenerOFallar(bovinoId);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return pesajeService.registrarPesaje(bovino, registradoPor, peso);
    }

    @Override
    public Boqueo registrarBoqueo(Long bovinoId, Long registradoPorId, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura) {
        Bovino bovino = bovinoService.obtenerOFallar(bovinoId);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return boqueoService.registrarBoqueo(bovino, registradoPor, dientes, deterioro, dentadura);
    }

    @Override
    public Vacunacion registrarVacunacion(Long bovinoId, Long registradoPorId, VacunaTipoEnum vacuna, LocalDate fechaAplicacion) {
        Bovino bovino = bovinoService.obtenerOFallar(bovinoId);
        Usuario registradoPor = validarUsuarioHabilitado(registradoPorId);
        return vacunacionService.registrarVacunacion(bovino, registradoPor, vacuna, fechaAplicacion);
    }

    @Override
    public Optional<Tacto> getUltimoTacto(Long bovinoId) {
        return tactoService.getUltimoTacto(bovinoService.obtenerOFallar(bovinoId));
    }

    @Override
    public Optional<Pesaje> getUltimoPesaje(Long bovinoId) {
        return pesajeService.getUltimoPesaje(bovinoService.obtenerOFallar(bovinoId));
    }

    @Override
    public Optional<Boqueo> getUltimoBoqueo(Long bovinoId) {
        return boqueoService.getUltimoBoqueo(bovinoService.obtenerOFallar(bovinoId));
    }

    @Override
    public List<Vacunacion> getVacunaciones(Long bovinoId) {
        return vacunacionService.getVacunacionesPorBovino(bovinoService.obtenerOFallar(bovinoId));
    }

    @Override
    public List<Pesaje> getTodosPesajes(Long bovinoId) {
        return pesajeService.getPesajesPorBovino(bovinoService.obtenerOFallar(bovinoId));
    }

    @Override
    public List<EventoSanitario> getCronologia(Long bovinoId) {
        return eventoSanitarioRepository.findByBovinoOrderByFechaHoraDesc(bovinoService.obtenerOFallar(bovinoId));
    }

    private Usuario validarUsuarioHabilitado(Long idUsuario) {
        if (idUsuario == null) return null;
        Usuario u = usuarioService.obtenerOFallar(idUsuario);
        if (!usuarioService.puedeRegistrarEventoSanitario(u)) {
            throw new IllegalArgumentException("El usuario " + idUsuario + " no está habilitado para registrar eventos sanitarios");
        }
        return u;
    }
}
