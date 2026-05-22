package vetrural.mvc.service;

import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import java.util.List;
import java.util.Optional;

public interface TactoService {
    Tacto registrarTacto(Bovino bovino, Sesion sesion, SituacionEnum situacion, PeriodoEnum periodo);
    List<Tacto> getTactosPorBovino(Bovino bovino);
    Optional<Tacto> getUltimoTacto(Bovino bovino);
    List<Tacto> listarTactos();
}
