package vetrural.mvc.service;

import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.enumerations.DentaduraEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DientesEnum;
import java.util.List;
import java.util.Optional;

public interface BoqueoService {
    Boqueo registrarBoqueo(Bovino bovino, Sesion sesion, DientesEnum dientes, DeterioroEnum deterioro, DentaduraEnum dentadura);
    List<Boqueo> getBoqueosPorBovino(Bovino bovino);
    Optional<Boqueo> getUltimoBoqueo(Bovino bovino);
    List<Boqueo> listarBoqueos();
}
