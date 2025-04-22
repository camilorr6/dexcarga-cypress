describe('User Registration Flow', () => {
    const registrationData = {
        companyCategoryIndex: 2, // Index for "Transportista"
        companyInfo: {
            catNumber: '1234',
            phone: '1234567890',
            validPassword: 'Altamira2015#',
            invalidPassword: 'short',
            mismatchedPassword: 'differentPassword',
        },
        termsAndConditionsSelector: {
            scrollableContainer: 'app-tos.ng-star-inserted > .tos > #content-tos',
            acceptButton: 'app-tos.ng-star-inserted > .tos > .botones > .dxf-btn-green',
            termsCheckbox: '#exampleCheck1',
        },
        successMessage: 'Exitoso',
        passwordMismatchError: 'La contraseña y la confirmación de la contraseña no son la misma.',
        invalidPasswordError: 'Por favor, complete los campos obligatorios.',
        visibilityTimeout: 10000,
    };

    let testCounter = 0; // Initialize a counter for unique names

    beforeEach(() => {
        cy.visit('https://dev.dexcarga.com/#/');
        cy.get('a[href="#/registry"] span.dxf-text-primary').click();
        cy.contains('Mi empresa es un(a)…').should('be.visible');

        // Select "Transportista" company category for all tests
        cy.get('.row.col-md-8')
            .within(() => {
            cy.get('.col-md-4.text-center').eq(registrationData.companyCategoryIndex).click();
            });
        cy.contains('Información de la empresa').should('be.visible');
        testCounter++; // Increment the counter for each test
        });

    // Helper function to fill basic company info with unique names
    const fillBasicCompanyInfo = (companyInfo) => {
        const uniqueSuffix = `_${Date.now()}_${testCounter}`;
        cy.get('input[formcontrolname="catNumber"]').type(companyInfo.catNumber);
        cy.get('input[formcontrolname="name"]').eq(0).type(`TestCompany${uniqueSuffix}`);
        cy.get('input[formcontrolname="phone"]').type(companyInfo.phone);
        cy.get('input[formcontrolname="name"]').eq(1).type(`TestName${uniqueSuffix}`);
        cy.get('input[formcontrolname="email"]').type(`prueba${uniqueSuffix}@mail.com`);
    };

    it('Should navigate to registration, select Transporter, fill details, accept terms, and see success message', () => {
        fillBasicCompanyInfo(registrationData.companyInfo);
        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.validPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.validPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        // Accept Terms and Conditions
        cy.get(registrationData.termsAndConditionsSelector.scrollableContainer)
            .last()
            .then(($el) => {
            const el = $el.get(0);
            el.scrollTop = el.scrollHeight;
            });
        cy.get(registrationData.termsAndConditionsSelector.acceptButton).click();
        cy.get(registrationData.termsAndConditionsSelector.termsCheckbox).click();
        cy.get(registrationData.termsAndConditionsSelector.acceptButton).click();

        // Verify success message visibility
        cy.contains(registrationData.successMessage, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });

    it('Should display an error message if the password is not valid', () => {
        fillBasicCompanyInfo(registrationData.companyInfo);
        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.invalidPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.invalidPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        // Assert that the generic required fields error message is visible
        cy.contains(registrationData.invalidPasswordError, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });

    it('Should display an error message if the password confirmation does not match', () => {
        fillBasicCompanyInfo(registrationData.companyInfo);
        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.validPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.mismatchedPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        // Assert that the password mismatch error message is visible
        cy.contains(registrationData.passwordMismatchError, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
        });
});