package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Establecimiento;
import java.util.List;

@Repository
public interface BovinoRepository extends JpaRepository<Bovino, String> {
    List<Bovino> findByLote(String lote);
    List<Bovino> findByEstablecimiento(Establecimiento establecimiento);
}
