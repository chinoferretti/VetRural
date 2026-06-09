package vetrural.mvc.enumerations;

public enum TipoBovinoEnum {
    Ternero,   // Macho recién nacido, sigue con la madre
    Ternera,   // Hembra recién nacida, sigue con la madre
    Novillito, // Macho castrado de 1 a 2 años
    Novillo,   // Macho castrado +2 años
    Vaquillona, // Hembra no parida entre 1 a 2 años
    Vaca,      // Hembra parida +2 años
    Torito,    // Macho no castrado -2 años
    Toro;      // Macho no castrado +2 años
}
