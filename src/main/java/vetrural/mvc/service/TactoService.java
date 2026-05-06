package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.enumerations.PeriodoEnum;
import vetrural.mvc.enumerations.SituacionEnum;
import vetrural.mvc.repository.TactoRepository;
import java.util.List;

@Service
public class TactoService {

    @Autowired
    private TactoRepository tactoRepository;

    public Tacto registrarTacto(String idBovino, SituacionEnum situacion, PeriodoEnum periodo) { // Registra un nuevo tacto
        Tacto tacto = new Tacto();
        tacto.setIdBovino(idBovino);
        tacto.setSituacion(situacion);
        tacto.setPeriodo(periodo);
        return tactoRepository.save(tacto);
    }

    public List<Tacto> getTactosPorBovino(String idBovino) { // Obtiene la lista de tactos de un bovino especifico por su ID
        return tactoRepository.findByIdBovino(idBovino);
    }

    public List<Tacto> listarTactos() { // Obtiene la lista de todos los tactos registrados en SQL
        return tactoRepository.findAll();
    }
}
