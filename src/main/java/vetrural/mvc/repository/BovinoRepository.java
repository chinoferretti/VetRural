package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Establecimiento;
import java.util.List;
import java.util.Optional;

@Repository
public interface BovinoRepository extends JpaRepository<Bovino, Long> {
    List<Bovino> findByLote(String lote);
    List<Bovino> findByEstablecimiento(Establecimiento establecimiento);
    Optional<Bovino> findByCaravana(String caravana);
    boolean existsByCaravana(String caravana);

    @Query("SELECT DISTINCT b.lote FROM Bovino b WHERE b.lote IS NOT NULL")
    List<String> findDistinctLotes();
}
