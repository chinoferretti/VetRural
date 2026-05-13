package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.repository.TactoRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TactoService {

    @Autowired
    private TactoRepository tactoRepository;

    public Tacto registrarTacto(Bovino bovino, Usuario registradoPor, SituacionEnum situacion, PeriodoEnum periodo) {
        Tacto tacto = new Tacto();
        tacto.setBovino(bovino);
        tacto.setRegistradoPor(registradoPor);
        tacto.setFechaHora(LocalDateTime.now());
        tacto.setSituacion(situacion);
        tacto.setPeriodo(periodo);
        return tactoRepository.save(tacto);
    }

    public List<Tacto> getTactosPorBovino(Bovino bovino) {
        return tactoRepository.findByBovino(bovino);
    }

    public Optional<Tacto> getUltimoTacto(Bovino bovino) {
        return tactoRepository.findTopByBovinoOrderByFechaHoraDesc(bovino);
    }

    public List<Tacto> listarTactos() {
        return tactoRepository.findAll();
    }
}
