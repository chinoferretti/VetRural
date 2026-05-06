package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Tacto;
import java.util.List;

@Repository
public interface TactoRepository extends JpaRepository<Tacto, Long> {
    List<Tacto> findByIdBovino(String idBovino); // Busca tactos por ID de bovino
}
