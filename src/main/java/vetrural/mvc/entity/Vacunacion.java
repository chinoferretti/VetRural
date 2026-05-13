package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.VacunaTipoEnum;

@Entity
@Table(name = "Vacunacion")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Vacunacion extends EventoSanitario {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VacunaTipoEnum vacuna;
}
