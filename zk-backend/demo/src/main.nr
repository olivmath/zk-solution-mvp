fn main(birth_year: u16, current_year: u16) {
    assert(current_year - birth_year >= 18);
}

#[test]
fn test_main() {
    main(1999, 2025);
}

#[test(should_fail)]
fn test_2_main() {
    main(2020, 2025);
}
