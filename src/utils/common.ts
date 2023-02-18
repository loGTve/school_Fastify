import _ from 'lodash';

export const validateEmailAddress = (emailAddress: string): boolean => {
    const regax = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    return regax.test(emailAddress);
};

export const validateMbtiType = (mbtiType: string): boolean => {
    const MBTI_TYPE = [
        'INFP', 'INFJ', 'INTP', 'INTJ',
        'ISFP', 'ISFJ', 'ISTP', 'ISTJ',
        'ENFP', 'ENFJ', 'ENTP', 'ENTJ',
        'ESFP', 'ESFJ', 'ESTP', 'ESTJ'
    ];

    return _.findIndex(MBTI_TYPE, value => value === mbtiType) !== -1;
};

export const validateBloodType = (bloodType: string): boolean => {
    const BLOOD_TYPE = [
        'AB',
        'A',
        'B',
        'O',
        'Etc.'
    ];

    return _.findIndex(BLOOD_TYPE, value => value === bloodType) !== -1;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
    const regax = new RegExp('[0-9]{3}-[0-9]{4}-[0-9]{4}');
    return regax.test(phoneNumber);
};

export const validateGender = (gender: string): boolean => {
    const GENDER_TYPE = [
        'MALE',
        'FEMALE',
        'Etc.'
    ];

    return _.findIndex(GENDER_TYPE, value => value === gender) !== -1;
};

export const validateDate = (date: string): boolean => {
    const regax = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');

    return regax.test(date);
};

// bulkQuery
export const bulkInsertValueString = (
        bulkValueRow: number,
        bulkValueColumn: number,
        startValueAt: number = 1
        ) => {
    return Array(bulkValueRow)
        .fill(0)
        .map(row => `(${
            Array(bulkValueColumn)
                .fill(0)
                .map(column => `$${ startValueAt++ }`)
                .join(', ')
        })`)
        .join(', ');
}