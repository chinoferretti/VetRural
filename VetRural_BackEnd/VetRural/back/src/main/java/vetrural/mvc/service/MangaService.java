package vetrural.mvc.service;

import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.EventoSanitario;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MangaService {
    Tacto registrarTacto(Long bovinoId, Long registradoPorId, SituacionEnum situacion, PeriodoEnum periodo);
    Pesaje registrarPesaje(Long bovinoId, Long registradoPorId, double peso);
    Boqueo registrarBoqueo(Long bovinoId, Long registradoPorId, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura);
    Vacunacion registrarVacunacion(Long bovinoId, Long registradoPorId, VacunaTipoEnum vacuna, LocalDate fechaAplicacion);
    Optional<Tacto> getUltimoTacto(Long bovinoId);
    Optional<Pesaje> getUltimoPesaje(Long bovinoId);
    Optional<Boqueo> getUltimoBoqueo(Long bovinoId);
    List<Vacunacion> getVacunaciones(Long bovinoId);
    List<Pesaje> getTodosPesajes(Long bovinoId);
    List<EventoSanitario> getCronologia(Long bovinoId);
}
