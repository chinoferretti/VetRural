package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;
import vetrural.mvc.enumerations.DientesEnum;
import vetrural.mvc.enumerations.DeterioroEnum;
import vetrural.mvc.enumerations.DentaduraEnum;

@Entity
@Table(name = "Boqueo")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Boqueo extends EventoSanitario {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DientesEnum dientes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeterioroEnum deterioro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DentaduraEnum dentadura;
}
