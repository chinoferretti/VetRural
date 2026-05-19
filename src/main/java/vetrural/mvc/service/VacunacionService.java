package vetrural.mvc.service;

import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import java.util.List;

public interface VacunacionService {
    Vacunacion registrarVacunacion(Bovino bovino, Usuario registradoPor, VacunaTipoEnum vacuna);
    List<Vacunacion> getVacunacionesPorBovino(Bovino bovino);
    List<Vacunacion> listarVacunaciones();
}
