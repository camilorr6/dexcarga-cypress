describe('User Registration Flow', () => {
    let registrationData;
    let testCounter = 0;

    before(() => {
        cy.fixture('RegistrationData').then((data) => {
            registrationData = data;
        });
    });

    beforeEach(() => {
        cy.visit('https://dev.dexcarga.com/#/');
        cy.get('a[href="#/registry"] span.dxf-text-primary').click();
        cy.contains('Mi empresa es un(a)…').should('be.visible');

        // Select the company category based on fixture data
        cy.get('.row.col-md-8')
            .within(() => {
                cy.get('.col-md-4.text-center').eq(registrationData.companyCategoryIndex).click();
            });
        cy.contains('Información de la empresa').should('be.visible');
        testCounter++; // Increment counter for unique data generation
    });

    // Take a screenshot if a test fails
    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            const screenshotName = `failed-${this.currentTest.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
            cy.screenshot(screenshotName);
        }
    });

    // Helper function to fill basic company information, accepting a unique suffix to ensure data uniqueness across test runs or retries
    const fillBasicCompanyInfo = (companyInfo, uniqueSuffix) => {
        cy.get('input[formcontrolname="catNumber"]').type(companyInfo.catNumber);
        cy.get('input[formcontrolname="name"]').eq(0).type(`TestCompany${uniqueSuffix}`);
        cy.get('input[formcontrolname="phone"]').type(companyInfo.phone);
        cy.get('input[formcontrolname="name"]').eq(1).type(`TestName${uniqueSuffix}`);
        cy.get('input[formcontrolname="email"]').type(`prueba${uniqueSuffix}@mail.com`);
    };

    it('Should navigate to registration, select Transporter, fill details, accept terms, and see success message', () => {
        const uniqueSuffix = `_${Date.now()}_${testCounter}`;

        // Intercept the collected form submission
        cy.intercept({
            method: 'POST',
            url: 'https://forms.hscollectedforms.net/collected-forms/submit/form'
        }).as('formSubmitRequest');

        fillBasicCompanyInfo(registrationData.companyInfo, uniqueSuffix);

        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.validPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.validPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        cy.wait('@formSubmitRequest').then((formInterception) => {

        const requestBody = formInterception.request.body;
            expect(formInterception.request.method).to.equal('POST');
            expect(formInterception.response.statusCode).to.equal(204);

            // Use registrationData.companyInfo for static values
            expect(requestBody.contactFields.email).to.equal(`prueba${uniqueSuffix}@mail.com`);
            expect(requestBody.formValues['Número CAAT']).to.equal(registrationData.companyInfo.catNumber);
            expect(requestBody.formValues['Razón social']).to.equal(`TestCompany${uniqueSuffix}`);
            expect(requestBody.formValues['Nombre completo']).to.equal(`TestName${uniqueSuffix}`);
        });

        // Accept Terms and Conditions
        cy.get(registrationData.termsAndConditionsSelector.scrollableContainer)
            .last()
            .then(($el) => {
                const el = $el.get(0);
                el.scrollTop = el.scrollHeight;
            });

        cy.get(registrationData.termsAndConditionsSelector.acceptButton).click();
        cy.get(registrationData.termsAndConditionsSelector.termsCheckbox).click({ force: true });
        cy.get(registrationData.termsAndConditionsSelector.acceptButton).last().click();

        // Verify success message visibility
        cy.contains(registrationData.successMessage, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });

    it('Should display an error message if the password is not valid', () => {
        const uniqueSuffix = `_${Date.now()}_${testCounter}`;
        fillBasicCompanyInfo(registrationData.companyInfo, uniqueSuffix);

        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.invalidPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.invalidPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        // Check for the specific password validation error message
        cy.contains(registrationData.invalidPasswordError, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });

    it('Should display an error message if the password confirmation does not match', () => {
        const uniqueSuffix = `_${Date.now()}_${testCounter}`;
        fillBasicCompanyInfo(registrationData.companyInfo, uniqueSuffix);

        cy.get('input[formcontrolname="password"]').type(registrationData.companyInfo.validPassword);
        cy.get('input[formcontrolname="confirmPassword"]').type(registrationData.companyInfo.mismatchedPassword);
        cy.get('button.btn-primary').contains('Siguiente').click();

        // Check for the password mismatch error message
        cy.contains(registrationData.passwordMismatchError, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });

    it('Should display an error message if the email is not valid', () => {
        const uniqueSuffix = `_${Date.now()}_${testCounter}`;
        fillBasicCompanyInfo(registrationData.companyInfo, uniqueSuffix);

        // Input an invalid email (for example, missing '@' or domain)
        cy.get('input[formcontrolname="email"]').clear().type(`invalidEmailFormat`);
        cy.get('input[formcontrolname="name"]').eq(0).focus();

        // Check for the specific email validation error message
        cy.contains(registrationData.emailValidationError, { timeout: registrationData.visibilityTimeout })
            .should('be.visible');
    });
});