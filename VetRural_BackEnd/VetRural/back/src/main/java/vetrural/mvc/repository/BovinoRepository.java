package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT b FROM Bovino b WHERE b.establecimiento = :est AND (b.estado = 'Activo' OR b.estado IS NULL)")
    List<Bovino> findActivosByEstablecimiento(@Param("est") Establecimiento establecimiento);

    @Query("SELECT b FROM Bovino b WHERE b.establecimiento = :est AND b.estado IS NOT NULL AND b.estado != 'Activo'")
    List<Bovino> findInactivosByEstablecimiento(@Param("est") Establecimiento establecimiento);
}
