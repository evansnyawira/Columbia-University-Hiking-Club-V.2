import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { userActions } from '../_actions';

import { Box } from 'grommet';
import { Add, Login} from 'grommet-icons';
import { EmailMaskedInput, FormFieldWrapper, OutlineButton, PrimaryButton } from '../_components';
import {
  FormBox,
  StyledTextInput,
  ButtonsBox,
  LoadingBox,
  StyledMainIcon,
  FormHeading,
} from '../_css/form.css';
import theme from '../_css/theme.js';

const LoginBox = styled(FormBox)`
  border-top: 6px solid ${theme.global.colors.brand};
`;

class LoginPage extends React.Component {
  constructor (props) {
    super(props);

    // reset login status
    this.props.dispatch(userActions.logout());

    this.state = {
      user: {
        email: '',
        password: '',
      },
      submitted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange (e) {
    const {name, value} = e.target;
    const {user} = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value,
      },
    });
  }

  handleSubmit (e) {
    e.preventDefault();

    this.setState({submitted: true});
    const {email, password} = this.state.user;
    const {dispatch} = this.props;
    if (email && password) {
      dispatch(userActions.login(email, password));
    }
  }

  render () {
    const {loggingIn} = this.props;
    const {user, submitted} = this.state;
    return (
      <LoginBox>
        <StyledMainIcon>
          <Login color='white' size='large'/>
        </StyledMainIcon>
        <FormHeading
          alignSelf="center"
          level={2}
        >Login</FormHeading>
        <Box>
          <form name="form" onSubmit={this.handleSubmit}>
            <FormFieldWrapper label='Email Address' refValue={user.email} submitted={submitted}>
              <EmailMaskedInput name="email" value={user.email}
                                onChange={this.handleChange}/>
            </FormFieldWrapper>
            <FormFieldWrapper label='Password' refValue={user.password} submitted={submitted}>
              <StyledTextInput name="password" value={user.password}
                               onChange={this.handleChange} type='password'/>
            </FormFieldWrapper>
            <ButtonsBox direction="row" align="center" gap="small" pad="large">
              <PrimaryButton label="Login" type="submit"
                             primary/>
              <Link to="/register">
                <OutlineButton icon={<Add size='small'/>} label="Register"/>
              </Link>
            </ButtonsBox>
            <LoadingBox>
              {loggingIn &&
              <img
                alt=""
                src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="/>
              }
            </LoadingBox>

          </form>
        </Box>
      </LoginBox>
    );
  }
}

function mapStateToProps (state) {
  const {loggingIn} = state.authentication;
  return {
    loggingIn,
  };
}

const connectedLoginPage = connect(mapStateToProps)(LoginPage);
export { connectedLoginPage as LoginPage };